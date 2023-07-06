const mysql = require('mysql2');

const weballDatabase = ({user, host, password, database}) => {
  return {
    connection: mysql.createConnection({
      user: user,
      host: host,
      password: password,
      database: database
    }),
    
    query: this.connection.query,
    
    connect: (callback) => {
      return this.connection.connect((err) => {
        if (err) {
          callback(err);
          return;
        }
        
        this.connection.query("CREATE TABLE IF NOT EISTS customers(orgname TEXT, password TEXT);", (err, result) => {
          if (err) {
            callback(err);
            return;
          }
          
          this.connection.query("CREATE TABLE IF NOT EISTS customer_websites(customer TEXT, domain TEXT);", (err, result) => {
            if (err) {
              callback(err);
              return;
            }
            
            this.connection.query("CREATE TABLE IF NOT EISTS user_prefs(username TEXT, password TEXT, preferences TEXT);", (err, result) => {
              callback(err);
            });
          });
        });
      });
    },
    
    addCustomer: (orgname, password, callback) => {
      this.getCustomer({
        orgname: orgname,
        callback: (err, customer, fieldss) => {
          if (err) {
            callback(err, null, null);
            return;
          }
          
          if (!customer) {
            callback(null, null, {
              status: 'Failed',
              message: 'Customer already registered'
            });
            
            return;
          }
          
          this.connection.query("INSERT INTO customers (orgname, password) VALUES (?, ?)",
                                [orgname, password],
                                (err, result) => callback(err, result, {
                                  status: 'Success',
                                  message: 'Customer registered successfully'
                                }));
        }
      });
    },
    
    getCustomer: ({orgname, password, callback}) => {
      if (!orgname || !password) callback(null, null);
      const orgnameQuery = 'orgname = ?';
      const passwordQuery = 'AND password = ?';
      const fullQuery = `SELECT * FROM customers WHERE ${orgnameQuery} ${password ? passwordQuery : ''};`;
      
      return this.connection.query(fullQuery, callback);
    },
    
    addCustomerWebsite: ({orgname, domain, callback}) => {
      this.getCustomer({
        orgname: orgname,
        callback: (err, customer, fields) => {
          if (err) {
            callback(err, null, null);
            return;
          }
          
          if (!customer) {
            callback(null, null, {
              status: 'Failed',
              message: 'Unknown customer'
            });
            
            return;
          }
          
          this.this.getCustomerWebsite({
            domain: domain,
            callback: (err, website) => {
              if (err) {
                callback(err, null, null);
                return;
              }
              
              if (website) {
                callback(null, null, {
                  status: 'Failed',
                  message: 'Website already registered'
                });

                return;
              }
              
              this.connection.query('INSERT INTO customer_websites (orgname, domain) VALUES (?, ?)',
                                    [orgname, domain],
                                    (err, result) => callback(err, result, {
                                      status: 'Success',
                                      message: 'Website added successfully'
                                    }));
            }
          })
        }
      })
    },
    
    getCustomerWebsite: ({domain, callback}) => {
      this.connection.query('SELECT * FROM customer_websites WHERE domain = ?',
                            domain,
                            callback);
    }
  };
}

module.exports = weballDatabase;
