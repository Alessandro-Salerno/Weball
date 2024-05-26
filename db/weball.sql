DROP DATABASE IF EXISTS weball;
CREATE DATABASE weball;
USE weball;


CREATE TABLE IF NOT EXISTS Customers
(
    id_customer INT PRIMARY KEY AUTO_INCREMENT,
    c_type CHAR(1) NOT NULL CHECK (c_type IN ('I', 'O')),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    billing_address TEXT NOT NULL,
    registration_date DATE NOT NULL,
    phone VARCHAR(16) NOT NULL
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS Organizations
(
    id_customer INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    hq_address TEXT NOT NULL,

    FOREIGN KEY (id_customer) REFERENCES Customers(id_customer)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS Individuals
(
    id_customer INT PRIMARY KEY,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,

    FOREIGN KEY (id_customer) REFERENCES Customers(id_customer)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS Plans
(
    id_plan INT PRIMARY KEY AUTO_INCREMENT,
    max_hits INT NOT NULL,
    max_yearly_hits INT NOT NULL,
    price FLOAT NOT NULL,
    price_per_req FLOAT NOT NULL,
    duration INT NOT NULL
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS Subscriptions
(
    id_subscription INT PRIMARY KEY AUTO_INCREMENT,
    id_plan INT NOT NULL,
    id_customer INT NOT NULL,
    domain VARCHAR(64) NOT NULL UNIQUE,
    num_hits INT DEFAULT 0,
    activation_date DATE NOT NULL,
    price_ceiling FLOAT DEFAULT 0,
    price_due FLOAT DEFAULT 0,

    FOREIGN KEY (id_customer) REFERENCES Customers(id_customer),
    FOREIGN KEY (id_plan) REFERENCES Plans(id_plan)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS Payments
(
    id_payment INT PRIMARY KEY AUTO_INCREMENT,
    id_subscription INT NOT NULL,
    amount_due FLOAT NOT NULL,
    date_due DATE NOT NULL,
    status CHAR(1) NOT NULL CHECK (status IN ('c', 'p', 'f')),

    FOREIGN KEY (id_subscription) REFERENCES Subscriptions(id_subscription)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS SubscriptionPreferences
(
    id_preference INT PRIMARY KEY AUTO_INCREMENT,
    id_subscription INT NOT NULL,
    pref_key VARCHAR(48) NOT NULL,
    pref_value VARCHAR(48) NOT NULL,

    FOREIGN KEY (id_subscription) REFERENCES Subscriptions(id_subscription)
) ENGINE=INNODB;

CREATE VIEW IF NOT EXISTS InstitutionalCustomers
AS
    SELECT a.id_customer,
           a.email,
           a.password_hash,
           a.billing_address,
           a.registration_date,
           a.phone,

           b.name,
           b.hq_address
    FROM
        Customers a
    INNER JOIN Organizations b
        ON a.id_customer = b.id_customer;

CREATE VIEW IF NOT EXISTS IndividualCustomers
AS
    SELECT a.id_customer,
           a.email,
           a.password_hash,
           a.billing_address,
           a.registration_date,
           a.phone,

           b.first_name,
           b.last_name
    FROM
        Customers a
    INNER JOIN Individuals b
        ON a.id_customer = b.id_customer;

CREATE INDEX IF NOT EXISTS iSubscriptions
ON Subscriptions(domain, id_customer);

CREATE INDEX IF NOT EXISTS iCustomers
ON Customers(email);

CREATE INDEX IF NOT EXISTS iPayments
ON Payments(id_subscription);

CREATE INDEX IF NOT EXISTS iSubscriptionPreferences
ON SubscriptionPreferences(id_subscription, pref_key);

CREATE PROCEDURE get_subscription @Domain nvarchar(64)
AS
    SELECT *
    FROM Subscriptions
    WHERE domain = @Domain
GO;

CREATE PROCEDURE get_pref @Domain nvarchar(64), @Key nvarchar(48)
AS
    SELECT b.*
    FROM Subscriptions a
    INNER JOIN SubscriptionPreferences b ON a.id_subscription = b.id_subscription
    WHERE a.domain = @Domain AND b.pref_key = @Key
GO;

CREATE PROCEDURE get_all_pref @Domain nvarchar(64)
AS
    SELECT b.*
    FROM Subscriptions a
    WHERE a.domain = @Domain
GO;