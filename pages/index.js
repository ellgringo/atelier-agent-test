export default function Home() {
  return (
    <div style={{padding: "40px", maxWidth: "800px", margin: "auto", fontFamily: "system-ui"}}>
      <h1 style={{fontSize: "3rem", color: "#01696f", marginBottom: "20px"}}>
        🎉 ATELIER AGENT IA PRÊT !
      </h1>
      <div style={{background: "#f0f9ff", padding: "30px", borderRadius: "16px", lineHeight: "1.6"}}>
        <p><strong>✅ Vercel + Supabase configurés</strong></p>
        <p><strong>Prochaines étapes :</strong></p>
        <ol style={{marginLeft: "20px"}}>
          <li>npm install</li>
          <li>npm run dev</li>
          <li>Config Supabase dans .env.local</li>
        </ol>
        <p style={{marginTop: "20px", fontSize: "1.1rem"}}>
          Ton app est prête à évoluer !
        </p>
      </div>
    </div>
  )
}
