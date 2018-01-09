({
	doInit : function(component, event) {
		this.validateRequiredInputs(component, event);
	},

	getSourceRecord : function(component, event){
		var query = 'SELECT Id, ' + component.get('v.sourceField') 
					+ ' FROM ' + component.get('v.sObjectName') 
					+ ' WHERE Id '
					+ ' = \'' + component.get('v.recordId') + '\' LIMIT 1';
		var action = component.get("c.querySObject");
        action.setParams({
            "query": query
        });
    	action.setCallback(this,function(response) {
    		var state = response.getState();
        	if (component.isValid() && state === "SUCCESS") {
        		component.set("v.sourceRecord", response.getReturnValue()); 
        		this.getRelatedRecordId(component, event);              
        	}else{
        		this.handleErrors(component, "Error: ",response);
        		console.log(response);
        	}
		});
    	$A.enqueueAction(action);
	},

	getRelatedRecordId : function(component, event){
		var matchId = component.get('v.sourceRecord').fields[component.get('v.sourceField')].value
        var whereClause = component.get('v.whereClause');
		var query = 'SELECT Id FROM ' + component.get('v.relatedRecordObjectName') 
					+ ' WHERE ' + component.get('v.targetField')
					+ ' = \'' + matchId + '\'';
        if(whereClause){
            query += ' ' + whereClause;
        }
		var action = component.get("c.querySObjects");
        action.setParams({
            "query": query
        });
    	action.setCallback(this,function(response) {
    		var state = response.getState();
        	if (component.isValid() && state === "SUCCESS") {
        		//component.set("v.relatedRecord", response.getReturnValue()); 
                var returnVal = response.getReturnValue();
                if(returnVal.length > 0){
                    component.set("v.relatedRecordId", returnVal[0].Id);
                    this.getRelatedRecord(component, event);
                }
        		 
        	}else{
        		this.handleErrors(component, "Error: ",response);
        		console.log(response);
        	}
		});
    	$A.enqueueAction(action);
	},

	getRelatedRecord : function(component, event){
		component.find("relatedRecordData").reloadRecord(
            component.get('v.relatedRecordObjectName'), // objectApiName
            null, // recordTypeId
            false, // skip cache?
            $A.getCallback(function() {
                var rec = component.get("v.relatedRecord");
                var error = component.get("v.relatedRecordError");
                if(error || (rec === null)) {
                    console.log("Error initializing record template: " + error);
                }
                else {
                    console.log("Record template initialized: " + rec.sobjectType);
                }
            })
        );
	},

    getFieldSections : function(component, event){
        var action = component.get("c.getFields");
        action.setParams({
            "sObjectName": component.get('v.relatedRecordObjectName'),
            "fieldSetString": component.get('v.fieldSets')
        });
        action.setCallback(this,function(response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                component.set("v.fieldSections", response.getReturnValue());
            }else{
                this.handleErrors(component, "Error: ",response);
                console.log(response);
            }
        });
        $A.enqueueAction(action);
    },

	validateRequiredInputs : function(component, event){
		var relObjectName = component.get('v.relatedRecordObjectName');
		var sourceField = component.get('v.sourceField');
        var targetField = component.get('v.targetField');
		var fieldSets = component.get('v.fieldSets');

        if(relObjectName == null || relObjectName == undefined){
            this.generateMessage(component
                                , 'Initialization Error'
                                , 'Contact your System Administrator and have them define a SObject in the App Builder.'
                                ,'error'
                                , false);
        }else if(sourceField == null || sourceField == undefined){
            this.generateMessage(component
                                , 'Initialization Error'
                                , 'Contact your System Administrator and have them define a field on the current object in the App Builder.'
                                ,'error'
                                , false);
        }else if(targetField == null || targetField == undefined){
            this.generateMessage(component
                                , 'Initialization Error'
                                , 'Contact your System Administrator and have them define a field on the related object in the App Builder.'
                                ,'error'
                                ,false);
        }else if(fieldSets == null || fieldSets == undefined){
            this.generateMessage(component
                                , 'Initialization Error'
                                , 'Contact your System Administrator and have them define 1 or more field sets to display in the App Builder.'
                                ,'error'
                                , false);
        }else{
            this.getFieldSections(component, event);
        }
	},

	handleErrors : function(component, title, response){
        console.log(response.getError());
        for(var key in response.getError()[0].fieldErrors){
            this.generateMessage(component
                                , 'Field Error'
                                , response.getError()[0].fieldErrors[key][0].message
                                , 'error'
                                , false);  
        }
        for(var key in response.getError()[0].pageErrors){
            this.generateMessage(component
                                , 'Page Error'
                                , response.getError()[0].pageErrors[key][0].message
                                , 'error'
                                , false); 
        }
    },

    showToast: function(component, title, message,type){
        if(typeof(message) === "string"){
            this.generateToast(component, title, message, type);	
        }else if(typeof(message) === "object"){
            for(var key in  message){
                this.generateToast(component, title, message[key], type);
            }
        }
        
	},
    generateToast: function(component, title, message, type){
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "sticky"
        });
        toastEvent.fire();	
    },
    generateMessage : function(component, title, text, severity, closable){
        var messages = component.get('v.messages');
        var message = {};
        message.title = title;
        message.severity = severity;
        message.message = text;
        message.closable = closable;
        messages.push(message);
        component.set('v.messages', messages);
    }
})