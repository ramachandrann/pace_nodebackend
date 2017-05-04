function REST_ROUTER(router,connection,md5) {
    var self = this;
    self.handleRoutes(router,connection,md5);
}

REST_ROUTER.prototype.handleRoutes= function(router, mysql, connection,md5) {
    router.get("/",function(req,res){
        res.json({"Message" : "Hello World !"});
    });

    router.post("/claims",function(req,res){        
        //the workflow id/version could be table based and always points to current.
        var ui_wrkflw_id = req.body.type  == "D" ? 1 : 2;

        var version = {};
        var query = "SELECT version as ver FROM ?? WHERE ??=? and active='Y'";
        var table = ["workflow","id", ui_wrkflw_id];
        query = mysql.format(query,table);
        console.log(query);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
            } else {                
                version = rows[0];
            }
            console.log(version.ver);

            var ui_wrkflw_ver_id = version.ver;
            var query1 = "INSERT INTO ??(??,??,??, ??) VALUES (?,?,?, ?)";
            var table1 = ["claim", 
                        "type", 
                        "workflow_id", 
                        "workflow_version", 
                        "status_code",
                        req.body.type, 
                        ui_wrkflw_id, 
                        ui_wrkflw_ver_id,
                        "D"];
            query1 = mysql.format(query1,table1);
            console.log(query1);
            connection.query(query1,function(err,rows){
                if(err) {
                    res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
                } else {
                    res.json({id: rows.insertId, 
                            type: req.body.claim_type, 
                            workflow_id: ui_wrkflw_id,
                            workflow_version: ui_wrkflw_ver_id,
                            status_code: "D"});
                }
            });
        });
    });

    router.get("/claims",function(req,res){
        var query = "SELECT * FROM ?? ORDER BY type, workflow_id, workflow_version";
        var table = ["claim"];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
            } else {
                res.json(rows);
            }
        });
    });

    router.get("/claims/:id",function(req,res){
        var query = "SELECT id, type, workflow_id, workflow_version, status_code FROM ?? WHERE ??=?";
        var table = ["claim","id",req.params.id];
        query = mysql.format(query,table);
        console.log(query);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
            } else {                
                res.json(rows[0]);
            }
        });
    });

    router.get("/claims/:id/info",function(req,res){
        var query = "SELECT id as claim_id, info_data1, info_data2, info_data3 FROM ?? WHERE ??=?";
        var table = ["claim","id",req.params.id];
        query = mysql.format(query,table);
        console.log(query);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
            } else {                
                res.json(rows[0]);
            }
        });
    });

    router.put("/claims",function(req,res){
        var query = "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?";
        var table = ["claim","info_data1",req.body.info_data1,
                             "info_data2",req.body.info_data2,
                             "info_data3",req.body.info_data3,
                             "id", req.body.claim_id
                             ];
        query = mysql.format(query,table);
        console.log(query);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
            } else {                
                res.json({id: req.body.claim_id, 
                          info_data1: req.body.info_data1, 
                          info_data1: req.body.info_data2,
                          info_data1: req.body.info_data3
                         });
            }
        });
    });

    router.delete("/claims/:id",function(req,res){
        var query = "DELETE from ?? WHERE ??=?";
        var table = ["claim","id",req.params.id];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
            } else {
                if(rows.affectedRows == 1) {
                    res.json(rows);
                } else {
                    res.status(404).send('Not found');
                }
            }
        });
    });

    //############### WORKFLOW API ################
    router.post("/workflows",function(req,res) {      
         //query the last known workflow for this id, increment version for the new one (should be atomic, for prototype we just do 2 ops)  
        console.log(req.body);
        var version = {};
        var query = "SELECT COALESCE(MAX(version)+1,1) as next_version FROM ?? WHERE ??=?";
        var table = ["workflow","id",req.body.id];
        query = mysql.format(query,table);
        console.log(query);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
            } else {                
                version = rows[0];
            }
            console.log(version.next_version);
            //TODO: avoid pyramid of doom :) use async/callback
            var query1 = "INSERT INTO ??(??, ??, ??, ??) VALUES (?, ?, ? , ?)";
            var table1 = ["workflow",
                        "id",
                        "version",
                        "active", 
                        "steps", 
                        req.body.id,
                        version.next_version,
                        req.body.active == true ? "Y": "N",
                        JSON.stringify({"steps": req.body.steps})];
            query1 = mysql.format(query1,table1);
            connection.query(query1,function(err,rows){
                if(err) {
                    res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
                } else {
                    res.json({id: req.body.id});
                }
            });
        });
    });

     router.get("/workflows",function(req,res) {
        var query = "SELECT * FROM ??";
        var table = ["workflow"];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
            } else {
                rows.forEach(function(row) {
                    let stepsJson = JSON.parse(row.steps);
                    row.steps = stepsJson.steps;
                    row.active = row.active =='Y' ? true : false;
                });
                res.json(rows);
            }
        });
    });

    router.put("/workflows",function(req,res){
        var query = "UPDATE ?? SET ?? = ?, ??  = ? WHERE ?? = ? AND ?? = ?";
        var table = ["workflow",
                    "active", (req.body.active ? 'Y': 'N'),
                    "steps", JSON.stringify({"steps": req.body.steps}),
                    "id", req.body.id,
                    "version", req.body.version];

        query = mysql.format(query,table);
        console.log(query);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
            } else {                
                res.json({id: req.body.id, active: req.body.active});
            }
        });
    });

    router.delete("/workflows/:id/:version",function(req,res){
        var query = "DELETE from ?? WHERE ??=? AND ?? = ?";
        var table = ["workflow","id", req.params.id, "version", req.params.version];
        query = mysql.format(query,table);
        console.log(query);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query" + err});
            } else {
                if(rows.affectedRows == 1) {
                    res.json(rows);
                } else {
                    res.status(404).send('Not found');
                }
            }
        });
    });
}

module.exports = REST_ROUTER;