({
	doInit : function(component, event, helper) {
		helper.doInit(component, event);
	},

	handleRecordUpdated: function(component, event, helper) {
        var eventParams = event.getParams();
        if(eventParams.changeType === "LOADED") {
             console.log(eventParams);
             console.log("Record is loaded successfully.");
            if(component.get('v.sourceRecord') !== null && component.get('v.relatedRecordId') === null){
            	helper.getRelatedRecordId(component, event);
            }
            
           // record is loaded (render other component which needs record data value)
            
        } else if(eventParams.changeType === "CHANGED") {
            console.log("Changed: " + eventParams);
            // record is changed
        } else if(eventParams.changeType === "REMOVED") {
            // record is deleted
        } else if(eventParams.changeType === "ERROR") {
             console.log("Error: " + eventParams);
            // there’s an error while loading, saving, or deleting the record
        }
    },

    waiting: function(component, event, helper) {
		document.getElementById("spinner").style.display = "";
	},
	 
	doneWaiting: function(component, event, helper) {
		document.getElementById("spinner").style.display = "none";
	},
})