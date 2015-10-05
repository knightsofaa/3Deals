/**
 * Created by nbakshi on 9/06/2015.
 */
var oracledb = require('oracledb');
//initialise connection pool when the app starts up
var conPool;
exports.initialize = function (callback) {
    oracledb.createPool(
        {
            user: "Yoga",
            password: "Welcome1#",
            connectString: "opc.opcau.com:1521/yogapdb.auoracle84096.oraclecloud.internal",
            poolMax: 8,
            poolMin: 1,
            poolIncrement: 1,
            poolTimeout: 60
        },
        function (err, pool) {
            if (err) {
                console.error("createPool() callback: " + err.message);
                return;
            }
            conPool = pool;
            callback();
        }
    );
};

exports.select = function (stmt, data, callback) {
    conPool.getConnection(function (err, connection) {
        connection.execute( stmt
            ,
            data,
            {outFormat: oracledb.OBJECT},
            function (err, result) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                console.log("yay");
                callback(result.rows);
                /* Release the connection back to the connection pool */
                connection.release(
                    function (err) {
                        if (err) {
                            console.error("normal release() callback " + err.message);
                            return;
                        }
                    }
                );
            }
        );
    })
};

exports.insertUpdate = function (stmt,data, callback) {
    conPool.getConnection(function (err, connection) {
        connection.execute(stmt
            ,
            data,
            function (err, result) {
                if (err) {
                    console.error(err.message);
                    return;
                }

                console.log("yay");
                callback();

                /* Release the connection back to the connection pool */
                connection.release(
                    function (err) {
                        if (err) {
                            console.error("normal release() callback " + err.message);
                            return;
                        }
                    }
                );
            }
        );
    })
};

