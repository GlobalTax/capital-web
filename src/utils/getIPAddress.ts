/**
 * Obtiene la dirección IP del usuario utilizando un servicio externo
 * Devuelve null si no se puede obtener
 */
export const getIPAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP address:', error);
    return null;
  }
};
