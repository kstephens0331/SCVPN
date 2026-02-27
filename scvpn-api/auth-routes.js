// scvpn-api/auth-routes.js — Self-hosted JWT auth endpoints
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY_DAYS = 30;

/**
 * Generate JWT access token
 */
function signAccessToken(user, secret) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role || "client",
      account_type: user.account_type || "personal",
      is_admin: user.is_admin || false,
    },
    secret,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate a cryptographically random refresh token
 */
function generateRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

/**
 * Verify a JWT access token — returns decoded payload or null
 */
export function verifyAccessToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

/**
 * Extract and verify Bearer token from request
 */
export function authenticateRequest(req, secret) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  return verifyAccessToken(token, secret);
}

/**
 * Register all /api/auth/* routes on the Fastify app
 */
export default function registerAuthRoutes(app, { db, emailService, supabase, JWT_SECRET, ADMIN_EMAILS, SITE_URL }) {
  // ---- POST /api/auth/signup ----
  app.post("/api/auth/signup", async (req, reply) => {
    try {
      const { email, password, full_name } = req.body || {};
      if (!email || !password) {
        return reply.code(400).send({ error: "Email and password are required" });
      }
      if (password.length < 8) {
        return reply.code(400).send({ error: "Password must be at least 8 characters" });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if email already exists
      const { rows: [existing] } = await db.query(
        "SELECT id, password_hash FROM profiles WHERE email = $1 LIMIT 1",
        [normalizedEmail]
      );

      if (existing) {
        // If they already have a password, they've already signed up
        if (existing.password_hash) {
          return reply.code(409).send({ error: "An account with this email already exists" });
        }
        // Existing profile without password (e.g., migrated from Supabase) — set password
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        await db.query(
          `UPDATE profiles SET password_hash = $1, full_name = COALESCE(full_name, $2),
           email_verified = true, updated_at = NOW() WHERE id = $3`,
          [hash, full_name || null, existing.id]
        );

        // Issue tokens
        const { rows: [profile] } = await db.query(
          "SELECT id, email, full_name, role, account_type FROM profiles WHERE id = $1",
          [existing.id]
        );
        const isAdmin = ADMIN_EMAILS.has(normalizedEmail);
        const user = { ...profile, is_admin: isAdmin };

        const access_token = signAccessToken(user, JWT_SECRET);
        const refresh_token = generateRefreshToken();
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 86400000);

        await db.query(
          "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
          [user.id, refresh_token, expiresAt.toISOString()]
        );

        return reply.send({
          access_token,
          refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, account_type: user.account_type, is_admin: isAdmin },
        });
      }

      // New user — create profile
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const verifyExpires = new Date(Date.now() + 24 * 3600000); // 24h

      const { rows: [newProfile] } = await db.query(
        `INSERT INTO profiles (id, email, full_name, password_hash, role, account_type, email_verified, email_verify_token, email_verify_expires, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, 'client', 'personal', false, $4, $5, NOW(), NOW())
         RETURNING id, email, full_name, role, account_type`,
        [normalizedEmail, full_name || null, hash, verifyToken, verifyExpires.toISOString()]
      );

      const isAdmin = ADMIN_EMAILS.has(normalizedEmail);
      const user = { ...newProfile, is_admin: isAdmin };

      // Issue tokens immediately (email verification can be done later)
      const access_token = signAccessToken(user, JWT_SECRET);
      const refresh_token = generateRefreshToken();
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 86400000);

      await db.query(
        "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, refresh_token, expiresAt.toISOString()]
      );

      // Send verification email
      try {
        if (emailService?.sendGridConfigured) {
          const verifyUrl = `${SITE_URL}/auth/callback?token=${verifyToken}&type=verify`;
          await emailService.sendVerificationEmail?.({
            userEmail: normalizedEmail,
            userName: full_name || normalizedEmail.split("@")[0],
            verifyUrl,
          });
        }
      } catch (emailErr) {
        app.log.warn({ error: emailErr.message }, "[signup] Failed to send verification email");
      }

      return reply.code(201).send({
        access_token,
        refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, account_type: user.account_type, is_admin: isAdmin },
      });
    } catch (err) {
      app.log.error({ error: err.message }, "[auth/signup] error");
      return reply.code(500).send({ error: "Signup failed" });
    }
  });

  // ---- POST /api/auth/login ----
  app.post("/api/auth/login", async (req, reply) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return reply.code(400).send({ error: "Email and password are required" });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const { rows: [profile] } = await db.query(
        "SELECT id, email, full_name, password_hash, role, account_type, email_verified FROM profiles WHERE email = $1 LIMIT 1",
        [normalizedEmail]
      );

      if (!profile) {
        return reply.code(401).send({ error: "Invalid email or password" });
      }

      // Lazy migration: if no password_hash, try Supabase auth as fallback
      if (!profile.password_hash) {
        if (supabase) {
          try {
            const { data, error: sbError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
            if (sbError || !data?.user) {
              return reply.code(401).send({ error: "Invalid email or password" });
            }
            // Supabase verified — migrate password to local
            const hash = await bcrypt.hash(password, SALT_ROUNDS);
            await db.query(
              "UPDATE profiles SET password_hash = $1, email_verified = true, updated_at = NOW() WHERE id = $2",
              [hash, profile.id]
            );
            app.log.info({ userId: profile.id }, "[auth/login] Lazy-migrated password from Supabase");
          } catch (sbErr) {
            app.log.error({ error: sbErr.message }, "[auth/login] Supabase fallback failed");
            return reply.code(401).send({ error: "Invalid email or password" });
          }
        } else {
          return reply.code(401).send({ error: "Invalid email or password" });
        }
      } else {
        // Normal bcrypt verification
        const valid = await bcrypt.compare(password, profile.password_hash);
        if (!valid) {
          return reply.code(401).send({ error: "Invalid email or password" });
        }
      }

      const isAdmin = ADMIN_EMAILS.has(normalizedEmail);
      const user = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role || "client",
        account_type: profile.account_type || "personal",
        is_admin: isAdmin,
      };

      const access_token = signAccessToken(user, JWT_SECRET);
      const refresh_token = generateRefreshToken();
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 86400000);

      await db.query(
        "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, refresh_token, expiresAt.toISOString()]
      );

      return reply.send({
        access_token,
        refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, account_type: user.account_type, is_admin: isAdmin },
      });
    } catch (err) {
      app.log.error({ error: err.message }, "[auth/login] error");
      return reply.code(500).send({ error: "Login failed" });
    }
  });

  // ---- POST /api/auth/refresh ----
  app.post("/api/auth/refresh", async (req, reply) => {
    try {
      const { refresh_token } = req.body || {};
      if (!refresh_token) {
        return reply.code(400).send({ error: "Refresh token required" });
      }

      // Find valid refresh token
      const { rows: [rt] } = await db.query(
        "SELECT id, user_id, expires_at FROM refresh_tokens WHERE token = $1 LIMIT 1",
        [refresh_token]
      );

      if (!rt) {
        return reply.code(401).send({ error: "Invalid refresh token" });
      }

      if (new Date(rt.expires_at) < new Date()) {
        await db.query("DELETE FROM refresh_tokens WHERE id = $1", [rt.id]);
        return reply.code(401).send({ error: "Refresh token expired" });
      }

      // Get user profile
      const { rows: [profile] } = await db.query(
        "SELECT id, email, full_name, role, account_type FROM profiles WHERE id = $1 LIMIT 1",
        [rt.user_id]
      );

      if (!profile) {
        await db.query("DELETE FROM refresh_tokens WHERE id = $1", [rt.id]);
        return reply.code(401).send({ error: "User not found" });
      }

      const isAdmin = ADMIN_EMAILS.has(profile.email);
      const user = { ...profile, is_admin: isAdmin };

      // Rotate refresh token
      const newRefreshToken = generateRefreshToken();
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 86400000);

      await db.query("DELETE FROM refresh_tokens WHERE id = $1", [rt.id]);
      await db.query(
        "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, newRefreshToken, expiresAt.toISOString()]
      );

      const access_token = signAccessToken(user, JWT_SECRET);

      return reply.send({
        access_token,
        refresh_token: newRefreshToken,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, account_type: user.account_type, is_admin: isAdmin },
      });
    } catch (err) {
      app.log.error({ error: err.message }, "[auth/refresh] error");
      return reply.code(500).send({ error: "Token refresh failed" });
    }
  });

  // ---- POST /api/auth/logout ----
  app.post("/api/auth/logout", async (req, reply) => {
    try {
      const { refresh_token } = req.body || {};
      if (refresh_token) {
        await db.query("DELETE FROM refresh_tokens WHERE token = $1", [refresh_token]);
      }

      // Also try to delete all tokens for this user if authenticated
      const decoded = authenticateRequest(req, JWT_SECRET);
      if (decoded?.sub) {
        await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [decoded.sub]);
      }

      return reply.send({ ok: true });
    } catch (err) {
      app.log.error({ error: err.message }, "[auth/logout] error");
      return reply.send({ ok: true }); // Always succeed on logout
    }
  });

  // ---- GET /api/auth/me ----
  app.get("/api/auth/me", async (req, reply) => {
    try {
      const decoded = authenticateRequest(req, JWT_SECRET);
      if (!decoded) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      const { rows: [profile] } = await db.query(
        "SELECT id, email, full_name, avatar_url, role, account_type, email_verified, created_at FROM profiles WHERE id = $1 LIMIT 1",
        [decoded.sub]
      );

      if (!profile) {
        return reply.code(404).send({ error: "User not found" });
      }

      const isAdmin = ADMIN_EMAILS.has(profile.email);

      return reply.send({
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: profile.role || "client",
          account_type: profile.account_type || "personal",
          is_admin: isAdmin,
          email_verified: profile.email_verified,
          created_at: profile.created_at,
        },
      });
    } catch (err) {
      app.log.error({ error: err.message }, "[auth/me] error");
      return reply.code(500).send({ error: "Failed to get user" });
    }
  });

  // ---- POST /api/auth/reset-password ----
  app.post("/api/auth/reset-password", async (req, reply) => {
    try {
      const { email } = req.body || {};
      if (!email) return reply.code(400).send({ error: "Email required" });

      const normalizedEmail = email.trim().toLowerCase();
      const { rows: [profile] } = await db.query(
        "SELECT id, full_name FROM profiles WHERE email = $1 LIMIT 1",
        [normalizedEmail]
      );

      // Always return success to prevent email enumeration
      if (!profile) {
        return reply.send({ ok: true, message: "If an account exists, a reset email has been sent." });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await db.query(
        "UPDATE profiles SET reset_token = $1, reset_token_expires = $2, updated_at = NOW() WHERE id = $3",
        [resetToken, resetExpires.toISOString(), profile.id]
      );

      // Send reset email
      try {
        if (emailService?.sendGridConfigured) {
          const resetUrl = `${SITE_URL}/reset-password?token=${resetToken}`;
          await emailService.sendPasswordResetEmail?.({
            userEmail: normalizedEmail,
            userName: profile.full_name || normalizedEmail.split("@")[0],
            resetUrl,
          });
        }
      } catch (emailErr) {
        app.log.warn({ error: emailErr.message }, "[reset-password] Failed to send reset email");
      }

      return reply.send({ ok: true, message: "If an account exists, a reset email has been sent." });
    } catch (err) {
      app.log.error({ error: err.message }, "[auth/reset-password] error");
      return reply.code(500).send({ error: "Reset request failed" });
    }
  });

  // ---- POST /api/auth/reset-password/confirm ----
  app.post("/api/auth/reset-password/confirm", async (req, reply) => {
    try {
      const { token, password } = req.body || {};
      if (!token || !password) return reply.code(400).send({ error: "Token and password required" });
      if (password.length < 8) return reply.code(400).send({ error: "Password must be at least 8 characters" });

      const { rows: [profile] } = await db.query(
        "SELECT id FROM profiles WHERE reset_token = $1 AND reset_token_expires > NOW() LIMIT 1",
        [token]
      );

      if (!profile) {
        return reply.code(400).send({ error: "Invalid or expired reset token" });
      }

      const hash = await bcrypt.hash(password, SALT_ROUNDS);

      await db.query(
        "UPDATE profiles SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = $2",
        [hash, profile.id]
      );

      // Invalidate all refresh tokens
      await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [profile.id]);

      return reply.send({ ok: true, message: "Password has been reset. Please sign in." });
    } catch (err) {
      app.log.error({ error: err.message }, "[auth/reset-password/confirm] error");
      return reply.code(500).send({ error: "Password reset failed" });
    }
  });

  // ---- GET /api/auth/verify-email ----
  app.get("/api/auth/verify-email", async (req, reply) => {
    try {
      const { token } = req.query;
      if (!token) return reply.code(400).send({ error: "Verification token required" });

      const { rows: [profile] } = await db.query(
        "SELECT id FROM profiles WHERE email_verify_token = $1 AND email_verify_expires > NOW() LIMIT 1",
        [token]
      );

      if (!profile) {
        return reply.code(400).send({ error: "Invalid or expired verification token" });
      }

      await db.query(
        "UPDATE profiles SET email_verified = true, email_verify_token = NULL, email_verify_expires = NULL, updated_at = NOW() WHERE id = $1",
        [profile.id]
      );

      return reply.send({ ok: true, message: "Email verified successfully" });
    } catch (err) {
      app.log.error({ error: err.message }, "[auth/verify-email] error");
      return reply.code(500).send({ error: "Email verification failed" });
    }
  });

  app.log.info("Auth routes registered");
}
