import React from 'react';
import { useRouter } from 'next/router';

// Ce fichier _app.js englobe toutes les pages de ton site
export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // On ne veut pas afficher le bouton flottant si on est DÉJÀ sur la page de l'agent
  // ou si on est en train d'imprimer le devis (pour que le bouton ne s'imprime pas sur le PDF)
  const hideButtonRoutes = ['/agent', '/login', '/devis'];
  const showFloatingButton = !hideButtonRoutes.includes(router.pathname);

  return (
    <>
      {/* La page normale qui est en train d'être chargée */}
      <Component {...pageProps} />

      {/* LE BOUTON MAGIQUE FLOTTANT EN BAS À DROITE */}
      {showFloatingButton && (
        <button
          onClick={() => router.push('/agent')}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '65px',
            height: '65px',
            borderRadius: '50%',
            background: '#3498db',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            fontSize: '28px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            transition: 'transform 0.2s ease, background 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = '#2980b9';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = '#3498db';
          }}
          title="Parler à l'Assistant IA"
        >
          🎙️
        </button>
      )}
    </>
  );
}
