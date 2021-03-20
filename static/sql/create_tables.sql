-- mysql -u root -p
-- GRANT ALL PRIVILEGES ON ekzachar.* TO 'eric'@'localhost';       
-- show databases;
-- use ekzachar;
-- show tables;
-- SELECT * FROM users;  

USE ekzachar;

CREATE TABLE messages(
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(40) NOT NULL,
    channelname VARCHAR(40) NOT NULL,
    text VARCHAR(300),
    timestamp DATETIME DEFAULT NOW(),
    replyid INT DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (email) REFERENCES users(email),
    FOREIGN KEY (channelname) REFERENCES channels(channelname)
);

CREATE TABLE channels(
    channelname VARCHAR(40) NOT NULL,
    timestamp DATETIME DEFAULT NOW(),
    PRIMARY KEY (channelname)
);

CREATE TABLE users
(
    email VARCHAR(40) NOT NULL,
    username VARCHAR(40) NOT NULL,
    password BINARY(40) NOT NULL,
    timestamp DATETIME DEFAULT NOW(),
    PRIMARY KEY (email)
);

-- initialize some made up chat messages into some made up channels from made up accounts
INSERT INTO users VALUES("ekzachar@uchicago.edu", "ekzachar_admin", "Glacier", NOW());
INSERT INTO users VALUES("rubberduck@uchicago.edu", "SirQuacksalot", "yellowbill123", NOW());
INSERT INTO users VALUES("ilikesports@uchicago.edu", "SuperSportsFan", "!ilikesportsandidontcarewhoknows?", NOW());
INSERT INTO users VALUES("unsafe@uchicago.edu", "HackMe", "badpassword", NOW());
INSERT INTO channels VALUES("General", NOW());
INSERT INTO channels VALUES("Cooking Recipes", NOW());
INSERT INTO channels VALUES("Club Sports", NOW());
INSERT INTO messages(email, channelname, text) VALUES("ekzachar@uchicago.edu", "General", "How do I use this?");
INSERT INTO messages(email, channelname, text) VALUES("unsafe@uchicago.edu", "General", "Paste your password into the General chat!");
INSERT INTO messages(email, channelname, text, replyid) VALUES("rubberduck@uchicago.edu", "General", "That sounds like a bright idea!", 2);
INSERT INTO messages(email, channelname, text, replyid VALUES("ilikesports@uchicago.edu", "General", "I don't think so...", 2);
INSERT INTO messages(email, channelname, text) VALUES("ekzachar@uchicago.edu", "Cooking Recipes", "Big fan of poultry over here");
INSERT INTO messages(email, channelname, text, replyid) VALUES("rubberduck@uchicago.edu", "Cooking Recipes", "Yeah, chicken of course, right?", 4);
INSERT INTO messages(email, channelname, text, replyid) VALUES("ekzachar@uchicago.edu", "Cooking Recipes", "Well now you've got me thinking about alternatives.", 4);
INSERT INTO messages(email, channelname, text) VALUES("ilikesports@uchicago.edu", "Club Sports", "Hi!");
INSERT INTO messages(email, channelname, text) VALUES("ilikesports@uchicago.edu", "Club Sports", "I like sports");
INSERT INTO messages(email, channelname, text) VALUES("ekzachar@uchicago.edu", "Club Sports", "Cool!");
INSERT INTO messages(email, channelname, text, replyid) VALUES("unsafe@uchicago.edu", "Club Sports", "You should use your favorite sports team as your password!", 8);
INSERT INTO messages(email, channelname, text, replyid) VALUES("rubberduck@uchicago.edu", "Club Sports", "You sure know a lot about password security!", 8);
INSERT INTO messages(email, channelname, text, replyid) VALUES("unsafe@uchicago.edu", "Club Sports", "Sure do!", 8);
