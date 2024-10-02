import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ClientForm.css'; 

const ClientDataForm = () => {
    const [clients, setClients] = useState([]);
    const [parts, setParts] = useState({});
    const [properties, setProperties] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        client_name: '',
        address: '',
        phone: '',
        part_name: '',
        part_description: '',
        property_name: '',
        property_value: ''
    });
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [selectedPartId, setSelectedPartId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        // Fetch clients data
        axios.get('http://localhost:5000/clients')
            .then(response => {
                setClients(response.data);
            })
            .catch(error => {
                console.error('Error fetching clients:', error);
            });

        // Fetch parts data
        axios.get('http://localhost:5000/parts')
            .then(response => {
                const partsByClient = response.data.reduce((acc, part) => {
                    acc[part.client_id] = acc[part.client_id] || [];
                    acc[part.client_id].push(part);
                    return acc;
                }, {});
                setParts(partsByClient);
            })
            .catch(error => {
                console.error('Error fetching parts:', error);
            });

        // Fetch properties data
        axios.get('http://localhost:5000/part_properties')
            .then(response => {
                const propertiesByPart = response.data.reduce((acc, prop) => {
                    acc[prop.part_id] = acc[prop.part_id] || [];
                    acc[prop.part_id].push(prop);
                    return acc;
                }, {});
                setProperties(propertiesByPart);
            })
            .catch(error => {
                console.error('Error fetching properties:', error);
            });
    };

    const handleAddNewData = () => {
        setShowForm(true);
        setFormData({
            client_name: '',
            address: '',
            phone: '',
            part_name: '',
            part_description: '',
            property_name: '',
            property_value: ''
        });
        setSelectedClientId(null);
        setSelectedPartId(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const url = selectedClientId && selectedPartId
            ? `http://localhost:5000/clients/${selectedClientId}/parts/${selectedPartId}` // For updating existing data
            : 'http://localhost:5000/clients'; // For adding new data

        const method = selectedClientId && selectedPartId ? 'put' : 'post';

        axios[method](url, formData)
            .then(response => {
                fetchData(); // Refresh data after update or add
                setShowForm(false); // Hide the form
                setSelectedClientId(null); // Reset selected IDs
                setSelectedPartId(null);
            })
            .catch(error => {
                console.error('Error adding or updating data:', error);
            });
    };

    const handleModify = (clientId, partId) => {
        const client = clients.find(client => client.client_id === clientId);
        const part = parts[clientId].find(part => part.part_id === partId);
        const partProps = properties[partId] || [];

        setFormData({
            client_name: client.name,
            address: client.address,
            phone: client.phone,
            part_name: part.part_name,
            part_description: part.part_description,
            property_name: partProps.length > 0 ? partProps[0].property_name : '',
            property_value: partProps.length > 0 ? partProps[0].property_value : ''
        });

        setSelectedClientId(clientId);
        setSelectedPartId(partId);
        setShowForm(true);
    };

    const handleDelete = (clientId) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            axios.delete(`http://localhost:5000/clients/${clientId}`)
                .then(response => {
                    alert(response.data.message);
                    // Refresh client list after deletion
                    setClients(clients.filter(client => client.client_id !== clientId));
                })
                .catch(error => {
                    console.error('Error deleting client:', error);
                    alert('Failed to delete client.');
                });
        }
    };


    return (
        <div className="client-details-container">
            <h1>Client Data</h1>
            <table className="client-table">
                <thead>
                    <tr>
                        <th>Client ID</th>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone Number</th>
                        <th>Part Name</th>
                        <th>Part Description</th>
                        <th>Property Name</th>
                        <th>Property Value</th>
                        <th>Modify</th>
                        <th>Delete</th> 
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => (
                        parts[client.client_id] && parts[client.client_id].length > 0 ? (
                            parts[client.client_id].map(part => (
                                properties[part.part_id] && properties[part.part_id].length > 0 ? (
                                    properties[part.part_id].map(prop => (
                                        <tr key={`${client.client_id}-${part.part_id}-${prop.property_id}`}>
                                            <td>{client.client_id}</td>
                                            <td>{client.user_id}</td>
                                            <td>{client.name}</td>
                                            <td>{client.address}</td>
                                            <td>{client.phone}</td>
                                            <td>{part.part_name}</td>
                                            <td>{part.part_description}</td>
                                            <td>{prop.property_name}</td>
                                            <td>{prop.property_value}</td>
                                            <td>
                                                <button className="modify-button" onClick={() => handleModify(client.client_id, part.part_id)}>
                                                    Modify
                                                </button>
                                            </td>
                                            <td>
                                                <button className='delete-button'  onClick={() => handleDelete(client.client_id)}>
                                                     Delete
                                                 </button>
                                            </td> 
                                        </tr>
                                    ))
                                ) : (
                                    <tr key={`${client.client_id}-${part.part_id}`}>
                                        <td>{client.client_id}</td>
                                        <td>{client.user_id}</td>
                                        <td>{client.name}</td>
                                        <td>{client.address}</td>
                                        <td>{client.phone}</td>
                                        <td>{part.part_name}</td>
                                        <td>{part.part_description}</td>
                                        <td colSpan="2">No properties available</td>
                                        <td>
                                            <button className="modify-button" onClick={() => handleModify(client.client_id, part.part_id)}>
                                                Modify
                                            </button>
                                        </td>
                                        <td>
                                             <button className='delete-button' onClick={() => handleDelete(client.client_id)} style={{ color: 'red' }}>
                                                 Delete
                                             </button>
                                        </td> 
                                    </tr>
                                )
                            ))
                        ) : (
                            <tr key={client.client_id}>
                                <td>{client.client_id}</td>
                                <td>{client.user_id}</td>
                                <td>{client.name}</td>
                                <td>{client.address}</td>
                                <td>{client.phone}</td>
                                <td colSpan="5">No parts available</td>
                            </tr>
                        )
                    ))}
                </tbody>
            </table>
            <button className="add-new-button" onClick={handleAddNewData}> Add Data </button>

            {showForm && (
                <div className="form-container">
                    <form onSubmit={handleFormSubmit}>
                        <h2>{selectedClientId ? "Modify Data" : "Add Data"}</h2>
                        <div>
                            <label>Client Name:</label>
                            <input
                                type="text"
                                name="client_name"
                                value={formData.client_name}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Address:</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Phone Number:</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Part Name:</label>
                            <input
                                type="text"
                                name="part_name"
                                value={formData.part_name}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Part Description:</label>
                            <input
                                type="text"
                                name="part_description"
                                value={formData.part_description}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Property Name:</label>
                            <input
                                type="text"
                                name="property_name"
                                value={formData.property_name}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Property Value:</label>
                            <input
                                type="text"
                                name="property_value"
                                value={formData.property_value}
                                onChange={handleFormChange}
                                required
                            />
                        </div>
                        <button type="submit">{selectedClientId ? "Update Data" : "Add Data"}</button>
                        <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ClientDataForm;
