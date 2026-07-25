const express = require('express');
const cors = require('cors');
const net = require('net');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

console.log('🔌 Démarrage du serveur proxy TCP pour impression directe...');

// Proxy pour connexion TCP vers l'imprimante
app.post('/tcp-print', async (req, res) => {
  const { host, port, data } = req.body;

  if (!host || !port || !data) {
    return res.status(400).json({
      error: 'Paramètres manquants: host, port, data requis'
    });
  }

  console.log(`🔗 Connexion TCP vers ${host}:${port}...`);

  try {
    const result = await sendTCPData(host, port, data);
    res.json({
      success: true,
      message: `Données envoyées vers ${host}:${port}`,
      details: result
    });
  } catch (error) {
    console.error('❌ Erreur TCP:', error.message);
    res.status(500).json({
      error: 'Erreur connexion TCP',
      details: error.message
    });
  }
});

// Test de connectivité TCP
app.post('/tcp-test', async (req, res) => {
  const { host, port } = req.body;

  if (!host || !port) {
    return res.status(400).json({
      error: 'Paramètres manquants: host, port requis'
    });
  }

  console.log(`🧪 Test connexion TCP ${host}:${port}...`);

  try {
    const isReachable = await testTCPConnection(host, port);
    res.json({
      success: true,
      reachable: isReachable,
      message: isReachable ?
        `${host}:${port} accessible` :
        `${host}:${port} non accessible`
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur test TCP',
      details: error.message
    });
  }
});

// Fonction pour envoyer des données via TCP
function sendTCPData(host, port, data) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let hasConnected = false;

    socket.setTimeout(5000);

    socket.on('connect', () => {
      hasConnected = true;
      console.log(`✅ Connecté à ${host}:${port}`);

      // Envoyer les données
      socket.write(data, 'utf8');

      // Attendre un peu puis fermer
      setTimeout(() => {
        socket.end();
        resolve({
          connected: true,
          bytesSent: Buffer.byteLength(data, 'utf8')
        });
      }, 1000);
    });

    socket.on('timeout', () => {
      if (!hasConnected) {
        console.log(`⏰ Timeout connexion ${host}:${port}`);
        socket.destroy();
        reject(new Error(`Timeout connexion ${host}:${port}`));
      }
    });

    socket.on('error', (error) => {
      console.log(`❌ Erreur connexion ${host}:${port}:`, error.message);
      socket.destroy();
      reject(error);
    });

    socket.on('close', () => {
      if (hasConnected) {
        console.log(`🔌 Connexion fermée ${host}:${port}`);
      }
    });

    // Initier la connexion
    socket.connect(port, host);
  });
}

// Fonction pour tester la connectivité TCP
function testTCPConnection(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(3000);

    socket.on('connect', () => {
      console.log(`✅ ${host}:${port} accessible`);
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      console.log(`⏰ ${host}:${port} timeout`);
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      console.log(`❌ ${host}:${port} inaccessible`);
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'active',
    message: 'Proxy TCP pour impression directe opérationnel',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur proxy TCP démarré sur port ${PORT}`);
  console.log('📋 Routes disponibles:');
  console.log('  GET  /health - Statut du serveur');
  console.log('  POST /tcp-test - Test connexion TCP');
  console.log('  POST /tcp-print - Envoi données TCP');
  console.log('');
  console.log('💡 Usage depuis React Native:');
  console.log('  fetch("http://localhost:3002/tcp-print", {');
  console.log('    method: "POST",');
  console.log('    headers: { "Content-Type": "application/json" },');
  console.log('    body: JSON.stringify({');
  console.log('      host: "192.168.223.13",');
  console.log('      port: 9100,');
  console.log('      data: "ESC/POS commands here"');
  console.log('    })');
  console.log('  })');
});

process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur proxy TCP...');
  process.exit(0);
});