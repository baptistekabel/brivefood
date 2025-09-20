class RemotePrinterService {
  constructor() {
    // 🔧 CONFIGUREZ L'URL DE VOTRE SERVEUR ICI
    // Si le serveur est sur un PC au restaurant avec IP locale:
    // this.serverUrl = 'http://192.168.1.50:3001'; // IP du PC restaurant
    
    // Si vous utilisez un serveur cloud (recommandé pour usage à distance):
    // this.serverUrl = 'https://votre-serveur.herokuapp.com';
    
    // Pour les tests en local:
    this.serverUrl = 'http://192.168.1.50:3001'; // ⬅️ MODIFIEZ CETTE IP
    
    this.timeout = 10000; // 10 secondes
  }

  // Test de connexion avec le serveur
  async testConnection() {
    try {
      console.log(`🔗 Test connexion serveur: ${this.serverUrl}`);
      
      const response = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new Error(`Serveur inaccessible: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Serveur connecté:', data.message);
      
      return {
        success: true,
        message: 'Serveur d\'impression connecté',
        serverInfo: data
      };

    } catch (error) {
      console.error('❌ Erreur connexion serveur:', error.message);
      return {
        success: false,
        error: `Serveur inaccessible: ${error.message}`
      };
    }
  }

  // Test de l'imprimante via le serveur
  async testPrinter() {
    try {
      console.log('🖨️ Test imprimante distante...');
      
      const response = await fetch(`${this.serverUrl}/printer/test`, {
        method: 'GET',
        timeout: this.timeout,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur test imprimante');
      }

      console.log('✅ Test imprimante réussi');
      return {
        success: true,
        message: 'Test d\'impression réussi',
        connected: data.connected
      };

    } catch (error) {
      console.error('❌ Erreur test imprimante:', error.message);
      return {
        success: false,
        error: `Test imprimante échoué: ${error.message}`
      };
    }
  }

  // Imprimer une commande à distance
  async printOrder(order) {
    try {
      console.log(`🖨️ Impression commande #${order.id} via serveur distant...`);
      
      // Validation des données
      if (!order || !order.id) {
        throw new Error('Données de commande invalides');
      }

      // Préparation des données pour le serveur
      const orderData = {
        id: order.id,
        customerName: order.customerName || 'Client',
        phone: order.phone || '',
        mode: order.mode || 'TAKEOUT',
        address: order.address || '',
        items: order.items || [],
        total: order.total || 0,
        paymentMethod: order.paymentMethod || 'cash',
        createdAt: order.createdAt || new Date().toISOString(),
      };

      console.log('📤 Envoi vers serveur:', orderData);

      // Envoi vers le serveur d'impression
      const response = await fetch(`${this.serverUrl}/print/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
        timeout: this.timeout,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur impression serveur');
      }

      console.log(`✅ Commande #${order.id} imprimée avec succès`);
      
      return {
        success: true,
        message: `Ticket imprimé automatiquement au restaurant`,
        timestamp: data.timestamp
      };

    } catch (error) {
      console.error(`❌ Erreur impression commande #${order.id}:`, error.message);
      
      return {
        success: false,
        error: `Impression échouée: ${error.message}`,
        fallback: true // Indique qu'on peut utiliser le fallback local
      };
    }
  }

  // Vérifier le statut du serveur
  async getServerStatus() {
    try {
      const response = await fetch(`${this.serverUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      });

      if (!response.ok) {
        return { online: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return {
        online: true,
        status: data.status,
        message: data.message,
        printer_ip: data.printer_ip,
        timestamp: data.timestamp
      };

    } catch (error) {
      return {
        online: false,
        error: error.message
      };
    }
  }

  // Configuration du serveur (pour l'admin)
  updateServerUrl(newUrl) {
    this.serverUrl = newUrl.replace(/\/$/, ''); // Supprimer le slash final
    console.log(`🔧 URL serveur mise à jour: ${this.serverUrl}`);
  }

  getServerUrl() {
    return this.serverUrl;
  }
}

// Instance singleton
const remotePrinterService = new RemotePrinterService();
export default remotePrinterService;