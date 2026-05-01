import { useState } from "react";
import { trpc } from "@/lib/trpc";
export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => { window.location.href = "/"; },
    onError: (err) => { setError(err.message || "Invalid password"); setLoading(false); },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    loginMutation.mutate({ password });
  };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f5"}}>
      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",width:"100%",maxWidth:"360px"}}>
        <h1 style={{marginBottom:"1.5rem",fontSize:"1.5rem",fontWeight:"bold",textAlign:"center"}}>Flux</h1>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:"1rem"}}>
            <label style={{display:"block",marginBottom:"0.5rem",fontWeight:500}}>Admin Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{width:"100%",padding:"0.5rem",border:"1px solid #ddd",borderRadius:"4px",fontSize:"1rem",boxSizing:"border-box"}} placeholder="Enter password" required />
          </div>
          {error && <p style={{color:"red",marginBottom:"1rem",fontSize:"0.875rem"}}>{error}</p>}
          <button type="submit" disabled={loading} style={{width:"100%",padding:"0.75rem",background:"#6366f1",color:"white",border:"none",borderRadius:"4px",fontSize:"1rem",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1}}>{loading?"Signing in...":"Sign In"}</button>
        </form>
      </div>
    </div>
  );
}
