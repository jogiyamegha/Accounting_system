const ClientService = require('../../db/services/ClientService');

exports.getDashboard = async(req) => {
    const allClients = await ClientService.totalRegisteredClients();
    const allActiveClients = await ClientService.totalActiveClients();
    return { allClients, allActiveClients };
}