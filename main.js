const express= require('express');
const mysql= require('mysql2');
const app=express();
var path = require('path');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Hudaiyur@1',
    database: 'mydb'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

app.use(express.static(path.join(__dirname,'views')))

app.set('view engine','ejs');
app.use(express.urlencoded({extended: false}));

app.get('/',(req,res)=>{
    res.render('index');  //links our ejs file 
    console.log("hello");
});

app.post('/investor',(req,res)=>{
    res.render('investor');
});

app.post('/company',(req,res)=>{
    res.render('company');
});

app.post('/isignin',(req,res)=>{
    const {name,password}=req.body;
    if (!name || !password){
        return res.status(400).send("Invalid Input");
    }

    
    connection.query('SELECT name,returnamount FROM investor WHERE name = (?) AND password = (?)', [name,password], (err, results) => {
        if (err) throw err;
        
        connection.query('SELECT name,email,contactno,funding,pitch,fr from company',(err,result2) => {
            if (err) throw err;
            const resultsforcompanytable = result2;
            
        
        if (results.length > 0) {
            const resultsforinvestortable = results[0];
            console.log("RESULT RESULT");
            console.log(resultsforinvestortable);
            res.render('idashboard',{resultsforinvestortable,resultsforcompanytable});
            
        } else {
            
            res.redirect('/');
            console.log("Wrong credentials.");

        }
    });
    });
});

app.post('/isignup',(req,res)=>{
    const {name,password,confirmpassword,email,contactno,tinno}=req.body;
    console.log(name,password,confirmpassword);
    if (!name || !password || !confirmpassword || !email || !contactno || !tinno){
        return res.status(400).send("Invalid Input");
    }
    if (password === confirmpassword){
        connection.query('INSERT INTO investor(name,password,email,contactno,tinno) values(?,?,?,?,?) ',[name,password,email,contactno,tinno],(err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error inserting user');
            }
             
            connection.query('SELECT name,returnamount FROM investor WHERE name = (?) AND password = (?)', [name,password], (err, results) => {
                if (err) throw err;
                
                connection.query('SELECT name,email,contactno,funding,pitch,fr from company',(err,result2) => {
                    if (err) throw err;
                    const resultsforcompanytable = result2;
                    
                
                if (results.length > 0) {
                    const resultsforinvestortable = results[0];
                    console.log("RESULT RESULT");
                    console.log(resultsforinvestortable);
                    res.render('idashboard',{resultsforinvestortable,resultsforcompanytable});
                    
                } else {
                    
                    res.redirect('/');
                    console.log("Wrong credentials.");
        
                }
                
            });
            });
            
            
        });
    }
    
});

app.post('/csignin',(req,res)=>{
    const {name,password}=req.body;
    if (!name || !password){
        return res.status(400).send("Invalid Input");
    }

    connection.query('SELECT * FROM company WHERE name = (?) AND password = (?)', [name,password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const fr = results[0].fr;
            //const fr = web3.utils.fromWei(investmentAmount, 'ether');
            console.log(results);
            const funding=results[0].funding;
            let message="Complete funding not recieved yet.";
            if (fr>=funding){
                message="Complete funding received";
            }
            
            res.render('cdashboard',{name,funding,fr,message});
        } else {
            
            res.render('company');
            console.log("Wrong credentials.");

        }
    });
});

app.post('/csignup',(req,res)=>{
    const {name,password,confirmpassword,email,contactno,funding,pitch}=req.body;
    console.log(name,password,confirmpassword);
    if (!name || !password || !confirmpassword || !email || !contactno || !funding || !pitch){
        return res.status(400).send("Invalid Input");
    }
    if (password === confirmpassword){
        connection.query('INSERT INTO company(name,password,email,contactno,funding,pitch) values(?,?,?,?,?,?) ',[name,password,email,contactno,funding,pitch],(err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error inserting user');
            }
            
            const fr = 0;
            console.log(results);
            
            let message="Complete funding not recieved yet.";
            if (fr>=funding){
                message="Complete funding received";
            }
            res.render('cdashboard',{name,funding,fr,message});
            
        });
    }
});


const {Web3}  = require('web3');

// Connect to Ganache RPC server
const web3 = new Web3('HTTP://127.0.0.1:7545'); // Use the RPC server address provided by Ganache

// Example: Print the list of accounts
web3.eth.getAccounts()
  .then(accounts => {
    console.log('Accounts:', accounts);
  })
  .catch(error => {
    console.error('Error:', error);
  });
  
const investorAddress = '0x72Cc623Ec2643DA4021f9b409DfD1664C2669a58'; // Replace with the investor's address
const startupAddress = '0x4B539Cd891d03F2431C4CAF9be9bC9b78CCa9e7e'; // Replace with the startup's address

const checkBalances = async () => {
    try {
        const investorBalance = await web3.eth.getBalance(investorAddress);
        const startupBalance = await web3.eth.getBalance(startupAddress);

        console.log('Investor Balance:', web3.utils.fromWei(investorBalance, 'ether'), 'ETH');
        console.log('Startup Balance:', web3.utils.fromWei(startupBalance, 'ether'), 'ETH');
    } catch (error) {
        console.error('Error:', error.message);
    }
};

checkBalances();

const performTransaction = async (amount) => {
    try {
        const investorBalanceBefore = await web3.eth.getBalance(investorAddress);
        const startupBalanceBefore = await web3.eth.getBalance(startupAddress);

        console.log('Investor Balance Before:', web3.utils.fromWei(investorBalanceBefore, 'ether'), 'ETH');
        console.log('Startup Balance Before:', web3.utils.fromWei(startupBalanceBefore, 'ether'), 'ETH');
        
        const transactionObject = {
            from: investorAddress,
            to: startupAddress,
            value: web3.utils.toWei(amount,'ether'),
        };
        

        const result = await web3.eth.sendTransaction(transactionObject);

        console.log('Investment successful. Transaction hash:', result.transactionHash);

        const investorBalanceAfter = await web3.eth.getBalance(investorAddress);
        const startupBalanceAfter = await web3.eth.getBalance(startupAddress);

        console.log('Investor Balance After:', web3.utils.fromWei(investorBalanceAfter, 'ether'), 'ETH');
        console.log('Startup Balance After:', web3.utils.fromWei(startupBalanceAfter, 'ether'), 'ETH');


        // Check if the target amount is reached
        
        
        let targetAmount = web3.utils.toWei('9', 'ether'); // Adjust target amount as needed
        const targetAmount2 = web3.utils.fromWei(targetAmount, 'ether');
        //const totalInvestment = BigInt(result.transactionHash);
        //console.log('Total Investment:', web3.utils.fromWei(totalInvestment, 'ether'), 'ETH');
        const totalInvestment = web3.utils.fromWei((investorBalanceBefore - investorBalanceAfter),'ether');
        console.log(totalInvestment);
        console.log(targetAmount2);

        if (Math.round(totalInvestment)>=((targetAmount2))) {
            console.log('Target amount reached. Closing the transaction.');
        } else {
            console.log('Target amount not reached. Keep investing.');
        }
    } 
    catch (error) {
        console.error('Error:', error.message);
}

};

app.post('/invest',(req,res)=>{
    const amount=req.body;
    
    //const investmentAmount = web3.utils.fromWei(amount.invest.toString(), 'ether');
    console.log(amount.invest);
    connection.query('UPDATE company SET fr=(?)',[amount.invest],(err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error inserting user');
        };

    })
    // Perform the transaction
    performTransaction(amount.invest);
    res.redirect('/');
});



const reverseTransaction = async (amount) => {
    try {
        const investorBalanceBefore = await web3.eth.getBalance(investorAddress);
        const startupBalanceBefore = await web3.eth.getBalance(startupAddress);

        console.log('Investor Balance Before:', web3.utils.fromWei(investorBalanceBefore, 'ether'), 'ETH');
        console.log('Startup Balance Before:', web3.utils.fromWei(startupBalanceBefore, 'ether'), 'ETH');
        
        const transactionObject = {
            from: startupAddress,
            to: investorAddress,
            value: web3.utils.toWei(amount,'ether'),
        };
        

        const result = await web3.eth.sendTransaction(transactionObject);

        console.log('Investment successful. Transaction hash:', result.transactionHash);

        const investorBalanceAfter = await web3.eth.getBalance(investorAddress);
        const startupBalanceAfter = await web3.eth.getBalance(startupAddress);

        console.log('Investor Balance After:', web3.utils.fromWei(investorBalanceAfter, 'ether'), 'ETH');
        console.log('Startup Balance After:', web3.utils.fromWei(startupBalanceAfter, 'ether'), 'ETH');
}
catch (error) {
    console.error('Error:', error.message);
};
}

app.post('/withdraw',(req,res)=>{
    connection.query('SELECT name,fr FROM company', (err, results) =>{
        const amount = results[0].fr;
        const name = results[0].name;
        reverseTransaction(amount);
    
    connection.query('UPDATE investor SET returnamount=(?)',[amount],(err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error inserting user');
        };
    connection.query('DELETE from company WHERE name=(?) ',[name],(err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error inserting user');
        };
        res.redirect('/');
    })
    })
})
});




const PORT= process.env.PORT || 3001;
app.listen(PORT, ()=> console.log('Server running on port ${PORT}'));