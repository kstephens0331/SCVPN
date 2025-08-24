import { useAuth } from "./auth.js"
export default async function boot(){ try{ await useAuth.getState().refresh() }catch{} }
