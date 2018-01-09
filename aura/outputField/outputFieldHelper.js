({
	getUIComponentType : function(fieldType) {
        var uiComponentType = "ui:outputText";
        
        if (fieldType == "BOOLEAN"){
            uiComponentType = "ui:outputCheckbox";
        } 
        else if (fieldType == "CURRENCY"){
            uiComponentType = "ui:outputCurrency";
        } 
        else if (fieldType == "DATE"){
            uiComponentType = "ui:outputDate";
        }
        else if (fieldType == "DATETIME"){
            uiComponentType = "ui:outputDateTime";
        }
        else if (fieldType == "DOUBLE"){
            uiComponentType = "ui:outputNumber";
        } 
        else if (fieldType == "EMAIL"){
            uiComponentType = "ui:outputEmail";
        } 
        else if (fieldType == "INTEGER"){
            uiComponentType = "ui:outputNumber";
        } 
        else if (fieldType == "PERCENT"){
            uiComponentType = "ui:outputNumber";
        } 
        else if (fieldType == "PHONE"){
            uiComponentType = "ui:outputPhone";
        } 
        else if (fieldType == "TEXTAREA"){
            uiComponentType = "ui:outputTextArea";
        } 
        else if (fieldType == "URL"){
            uiComponentType = "ui:outputURL";
        }
        else if (fieldType == "REFERENCE"){
            uiComponentType = "c:referenceField";
        }
        else {
            uiComponentType = "ui:outputText";
        }
        
        return uiComponentType;
	},
    
    createField : function(component, event, helper, uiComponentType){
        $A.createComponent(
            uiComponentType,
            {
                "value": this.getFieldValue(component),
                "class": component.get("v.class")
            },
            function(uiComponent, status, errorMessage){
                if (status === "SUCCESS") {
                    helper.setFieldBody(component, uiComponent);
                }
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.")
                }
                else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                }
            }
        );
    },

    createURLField : function(component, event, helper){
        var urlLabel = component.get("v.label");
        if (urlLabel == null || urlLabel == undefined || urlLabel == ""){
            urlLabel = component.get("v.value");
        }
        
        $A.createComponent(
            "ui:outputURL",
            {
                "value": this.getFieldValue(component),
                "label": urlLabel,
                "class": component.get("v.class")
            },
            function(urlField, status, errorMessage){
                if (status === "SUCCESS") {
                    helper.setFieldBody(component, urlField);
                }
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.")
                }
                else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                }
            }
        );
    },

    createReferenceField : function(component, event, helper){
        var fieldLabel = this.getReferenceLabel(component);
        if (fieldLabel == null || fieldLabel == undefined || fieldLabel == ""){
            fieldLabel = this.getReferenceValue(component);
        }
        var referenceId = this.getReferenceValue(component);
        if(referenceId){
            $A.createComponent(
                "c:referenceField",
                {
                    "referenceRecordId": referenceId,
                    "referenceRecordName": fieldLabel,
                    "class": component.get("v.class")
                },
                function(refField, status, errorMessage){
                    if (status === "SUCCESS") {
                        helper.setFieldBody(component, refField);
                    }
                    else if (status === "INCOMPLETE") {
                        console.log("No response from server or client is offline.")
                    }
                    else if (status === "ERROR") {
                        console.log("Error: " + errorMessage);
                    }
                }
            );
        }
        
    },
    
    setFieldBody : function(component, createdField){
        var componentBody = component.get("v.body");
        componentBody.push(createdField);
        component.set("v.body", componentBody);
    },

    getFieldValue : function(component){
    	var record = component.get("v.record");
    	var field = component.get("v.field");

    	return record[field];
    },


    getReferenceValue : function(component){
        var record = component.get("v.record");
        var field = component.get("v.field");

        if(field.toLowerCase().endsWith("id")){
            field = field.slice(0, field.length-2);
        }else if(field.toLowerCase().endsWith("__c")){
            field = field.slice(0, field.length-1) + 'r';
        }

        if(record[field]){
            return record[field]["Id"];
        }else{
            return;
        }

        
    },

    getReferenceLabel : function(component){
    	var record = component.get("v.record");
    	var field = component.get("v.field");

    	if(field.toLowerCase().endsWith("id")){
            field = field.slice(0, field.length-2);
        }else if(field.toLowerCase().endsWith("__c")){
            field = field.slice(0, field.length-1) + 'r';
        }

        var name;
        if(record[field] && record[field]["Id"]){
            name = record[field]["Id"].startsWith('x') ? 'Name__c' : 'Name';
            return record[field][name]; 
        }else{
            return;
        }
        
        
        
    }
})