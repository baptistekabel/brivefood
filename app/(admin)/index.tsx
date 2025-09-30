import { Redirect } from 'expo-router';

export default function AdminIndex() {
  // Redirection automatique vers le dashboard des commandes
  return <Redirect href="/(admin)/dashboard" />;
}