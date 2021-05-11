// @ts-nocheck
sap.ui.define([
    "logaligroup/Employees/controller/Base.controller",
    "logaligroup/Employees/model/formatter",
    "sap/m/MessageBox"
],
    /**
     * 
     * @param {typeof sap.m.MessageBox} MessageBox
     */
    function (Base, formatter, MessageBox) {

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        };

        function onCreateIncidence() {

            var tableIncidence = this.getView().byId("tableIncidence");
            var newIncidence = sap.ui.xmlfragment("logaligroup.Employees.fragment.NewIncidence", this);

            var incidenceModel = this.getView().getModel("incidenceModel");
            var odata = incidenceModel.getData();
            var index = odata.length;
            odata.push({ index: index + 1, _ValidateDate: false, EnabledSave: false });

            incidenceModel.refresh();

            newIncidence.bindElement("incidenceModel>/" + index);
            tableIncidence.addContent(newIncidence);
        };

        function onDeleteIncidence(oEvent) {

            let oContext = oEvent.getSource().getBindingContext("incidenceModel").getObject();
            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            MessageBox.confirm(oResourceBundle.getText("confirmDeleteIncidence"), {

                onClose: function (oAction) {

                    if (oAction === "OK") {
                        //All CRUD operations must be in Main.controller.js
                        this._bus.publish("incidence", "onDeleteIncidence", {
                            IncidenceId: oContext.IncidenceId,
                            SapId: oContext.SapId,
                            EmployeeId: oContext.EmployeeId
                        });
                    }

                }.bind(this)

            });

            /* //Before CRUD, we only remove from table in user's interface
            var tableIncidence = this.getView().byId("tableIncidence");
            var rowIncidence = oEvent.getSource().getParent().getParent();
            var incidenceModel = this.getView().getModel("incidenceModel");
            var odata = incidenceModel.getData();
            var oContext = rowIncidence.getBindingContext("incidenceModel");

            odata.splice(oContext.getProperty("index") - 1, 1);
            for (var i in odata) {
                odata[i].index = parseInt(i) + 1;
            };

            incidenceModel.refresh();

            tableIncidence.removeContent(rowIncidence);

            for (var j in tableIncidence.getContent()) {
                tableIncidence.getContent()[j].bindElement("incidenceModel>/" + j);
            };
            */

        };

        function onSaveIncidence(oEvent) {
            var incidence = oEvent.getSource().getParent().getParent();
            var incidenceRow = incidence.getBindingContext("incidenceModel");
            //incidenceRow.sPath = /0 or /1, etc... we only want the number so we use replace
            this._bus.publish("incidence", "onSaveIncidence", { incidenceRow: incidenceRow.sPath.replace('/', '') });
        };

        function updateIncidenceCreationDate(oEvent) {

            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let oContext = context.getObject();
            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            if (!oEvent.getSource().isValidValue()) {     //Get current date of DatePicker
                oContext._ValidateDate = false;
                oContext.CreationDateState = "Error";
                MessageBox.error(oResourceBundle.getText("errorCreationDateValue"), {
                    title: oResourceBundle.getText("errorTitle"),
                    onClose: null,
                    styleClass: "",
                    actions: MessageBox.Action.CLOSE,
                    emphasizedAction: null,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            } else {
                oContext.CreationDateX = true;
                oContext._ValidateDate = true;
                oContext.CreationDateState = "None";
            };

            if (oEvent.getSource().isValidValue() && oContext.Reason) {
                oContext.EnabledSave = true;
            } else {
                oContext.EnabledSave = false;
            };

            context.getModel().refresh();

        };

        function updateIncidenceReason(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let oContext = context.getObject();
            if (oEvent.getSource().getValue()) {
                oContext.ReasonX = true;
                oContext.ReasonState = "None";
            } else {
                oContext.ReasonState = "Error";
            };

            if (oContext._ValidateDate && oEvent.getSource().getValue()) {
                oContext.EnabledSave = true;
            } else {
                oContext.EnabledSave = false;
            };

            context.getModel().refresh();
        };

        function updateIncidenceType(oEvent) {

            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let oContext = context.getObject();

            oContext.TypeX = true;

            if (oContext._ValidateDate && oContext.Reason) {
                oContext.EnabledSave = true;
            } else {
                oContext.EnabledSave = false;
            };

            context.getModel().refresh();
        };

        /*This function is now inherited from Base controller
        function toOrderDetails(oEvent){
            let orderId = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);   //get router initialized in Component.js
            oRouter.navTo("RouteOrderDetails",{
                OrderID: orderId
            });
        };
        */

        var EmployeeDetails = Base.extend("logaligroup.Employees.controller.EmployeeDetails", {});

        EmployeeDetails.prototype.onInit = onInit;
        EmployeeDetails.prototype.onCreateIncidence = onCreateIncidence;
        EmployeeDetails.prototype.Formatter = formatter;
        EmployeeDetails.prototype.onDeleteIncidence = onDeleteIncidence;
        EmployeeDetails.prototype.onSaveIncidence = onSaveIncidence;
        EmployeeDetails.prototype.updateIncidenceCreationDate = updateIncidenceCreationDate;
        EmployeeDetails.prototype.updateIncidenceReason = updateIncidenceReason;
        EmployeeDetails.prototype.updateIncidenceType = updateIncidenceType;
        //EmployeeDetails.prototype.toOrderDetails = toOrderDetails;

        return EmployeeDetails;

    });