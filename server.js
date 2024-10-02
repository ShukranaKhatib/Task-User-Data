const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // To parse JSON body

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Change this to your MySQL username
    password: '', // Change this to your MySQL password
    database: 'login_db', // Change this to your database name
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Registration failed' });
        }
        res.json({ message: 'Registration successful' });
    });
});

// Login route

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Incorrect username or password' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password); // Compare hashed password

        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect username or password' });
        }

        res.json({ message: 'Login successful' });
    });
});

// Change Password Endpoint
app.post('/change-password', async (req, res) => {
    const { username, newPassword } = req.body;

    // Retrieve the current password from the database
    const query = 'SELECT password FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentPassword = results[0].password;

        // Check if the new password matches the current password
        const isMatch = await bcrypt.compare(newPassword, currentPassword);

        if (isMatch) {
            return res.status(400).json({ message: 'Password already exists' });
        }

        // Hash the new password before saving it
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const sql = "UPDATE users SET password = ? WHERE username = ?";
        db.query(sql, [hashedPassword, username], (err, result) => {
            if (err) {
                return res.status(500).send("Error updating password");
            }

            res.send({ message: "Password changed successfully" });
        });
    });
});

// Fetch All Clients Endpoint (for client data)
app.get('/clients', (req, res) => {
    const query = 'SELECT * FROM client'; 
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
}); 

// Fetch Parts Data by Client ID Endpoint
app.get('/clients/:clientId/parts', (req, res) => {
    const { clientId } = req.params;
    const query = 'SELECT * FROM part WHERE client_id = ?'; 
    db.query(query, [clientId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});


// Fetch Parts Data by Client ID Endpoint
app.get('/clients/:clientId/parts', (req, res) => {
    const { clientId } = req.params;
    const query = 'SELECT part_id, client_id, part_name, part_description, part_value FROM part WHERE client_id = ?'; 
    db.query(query, [clientId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// Fetch Properties Data by Part ID Endpoint
app.get('/parts/:partId/properties', (req, res) => {
    const { partId } = req.params;
    const query = 'SELECT * FROM part_properties WHERE part_id = ?'; 
    db.query(query, [partId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});


// Get parts
app.get('/parts', (req, res) => {
    const sql = 'SELECT * FROM part';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Get part properties
app.get('/part_properties', (req, res) => {
    const sql = 'SELECT * FROM part_properties';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Add a new client along with parts and properties
app.post('/clients', (req, res) => {
    const { client_name, address, phone, part_name, part_description, property_name, property_value } = req.body;

    // Insert into client table
    const clientQuery = 'INSERT INTO client (name, address, phone) VALUES (?, ?, ?)';
    db.query(clientQuery, [client_name, address, phone], (err, clientResult) => {
        if (err) {
            console.error('Error inserting client:', err);
            return res.status(500).json({ message: 'Error inserting client' });
        }
        const clientId = clientResult.insertId;

        // Insert into part table
        const partQuery = 'INSERT INTO part (client_id, part_name, part_description) VALUES (?, ?, ?)';
        db.query(partQuery, [clientId, part_name, part_description], (err, partResult) => {
            if (err) {
                console.error('Error inserting part:', err);
                return res.status(500).json({ message: 'Error inserting part' });
            }
            const partId = partResult.insertId;

            // Insert into part_properties table
            const propertyQuery = 'INSERT INTO part_properties (part_id, property_name, property_value) VALUES (?, ?, ?)';
            db.query(propertyQuery, [partId, property_name, property_value], (err, propertyResult) => {
                if (err) {
                    console.error('Error inserting property:', err);
                    return res.status(500).json({ message: 'Error inserting property' });
                }
                // Successfully inserted all data
                res.status(200).json({ message: 'Data inserted successfully' });
            });
        });
    });
});

app.put('/clients/:clientId/parts/:partId', (req, res) => {
    const { clientId, partId } = req.params;
    const { client_name, address, phone, part_name, part_description, property_name, property_value } = req.body;

    // Update client data
    const updateClientQuery = 'UPDATE client SET name = ?, address = ?, phone = ? WHERE client_id = ?';
    db.query(updateClientQuery, [client_name, address, phone, clientId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Update part data
        const updatePartQuery = 'UPDATE part SET part_name = ?, part_description = ? WHERE part_id = ? AND client_id = ?';
        db.query(updatePartQuery, [part_name, part_description, partId, clientId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Update properties data
            const updatePropertyQuery = 'UPDATE part_properties SET property_name = ?, property_value = ? WHERE part_id = ?';
            db.query(updatePropertyQuery, [property_name, property_value, partId], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.status(200).json({ message: 'Data updated successfully' });
            });
        });
    });
});

// Delete Client by ID Endpoint
app.delete('/clients/:clientId', (req, res) => {
    const { clientId } = req.params;

    // First, delete the associated properties
    const deletePropertiesQuery = 'DELETE FROM part_properties WHERE part_id IN (SELECT part_id FROM part WHERE client_id = ?)';
    db.query(deletePropertiesQuery, [clientId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting properties' });
        }

        // Then, delete the associated parts
        const deletePartsQuery = 'DELETE FROM part WHERE client_id = ?';
        db.query(deletePartsQuery, [clientId], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting parts' });
            }

            // Finally, delete the client
            const deleteClientQuery = 'DELETE FROM client WHERE client_id = ?';
            db.query(deleteClientQuery, [clientId], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error deleting client' });
                }

                res.status(200).json({ message: 'Client deleted successfully' });
            });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
