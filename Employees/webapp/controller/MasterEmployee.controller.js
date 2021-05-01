// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */
    function (Controller, Filter, FilterOperator) {
        "use strict";

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();

        };

        function onFilter() {
            var oJSONCountries = this.getView().getModel("jsonCountries").getData();
            var filters = [];

            if (oJSONCountries.EmployeeId !== '') {
                filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSONCountries.EmployeeId));
            }

            if (oJSONCountries.CountryKey !== '') {
                filters.push(new Filter("Country", FilterOperator.EQ, oJSONCountries.CountryKey));
            }

            var oList = this.getView().byId("tableEmployee");
            var oBinding = oList.getBinding("items");
            oBinding.filter(filters);
        };

        function onClearFilter() {
            var oModel = this.getView().getModel("jsonCountries");
            oModel.setProperty("/EmployeeId", "");
            oModel.setProperty("/CountryKey", "");
        };

        function showPostalCode(oEvent) {
            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext("jsonEmployees");
            var objectContext = oContext.getObject();

            sap.m.MessageToast.show(objectContext.PostalCode);
        };

        function onShowCity(){
            var oJSONModelConfig = this.getView().getModel("jsonConfig");
            oJSONModelConfig.setProperty("/visibleCity", true);
            oJSONModelConfig.setProperty("/visibleBtnShowCity", false);
            oJSONModelConfig.setProperty("/visibleBtnHideCity", true);
        };

        function onHideCity(){
            var oJSONModelConfig = this.getView().getModel("jsonConfig");
            oJSONModelConfig.setProperty("/visibleCity", false);
            oJSONModelConfig.setProperty("/visibleBtnShowCity", true);
            oJSONModelConfig.setProperty("/visibleBtnHideCity", false);
        };

        function showOrders(oEvent){

            //Get selected controller
            var iconPressed = oEvent.getSource();

            //Context from the model
            var oContext = iconPressed.getBindingContext("jsonEmployees");

            if(!this._oDialogOrders){
                this._oDialogOrders = sap.ui.xmlfragment("logaligroup.Employees.fragment.DialogOrders", this);
                this.getView().addDependent(this._oDialogOrders);
            };

            //Dialog binding to the context to have access to the data of selected item
            this._oDialogOrders.bindElement("jsonEmployees>" + oContext.getPath());
            this._oDialogOrders.open();

            /*Two dynamic tables to display orders
            var ordersTable = this.getView().byId("ordersTable");
            ordersTable.destroyItems();

            var itemPressed = oEvent.getSource();
            var oBindingContext = itemPressed.getBindingContext("jsonEmployees");
            var oObjectContext = oBindingContext.getObject();
            var orders = oObjectContext.Orders; //get actual content of the Orders property of the model

            var ordersItems=[];

            for(var i in orders){
                ordersItems.push(new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Label({ text: orders[i].OrderID}),
                        new sap.m.Label({ text: orders[i].Freight}),
                        new sap.m.Label({ text: orders[i].ShipAddress})
                    ]
                }));
            }

            var newTable = new sap.m.Table({
                width: "auto",
                columns: [
                    new sap.m.Column({
                        header: new sap.m.Label({text: "{i18n>orderId}"})
                    }),
                    new sap.m.Column({
                        header: new sap.m.Label({text: "{i18n>freight}"})
                    }),
                    new sap.m.Column({
                        header: new sap.m.Label({text: "{i18n>shipAddress}"})
                    })
                ],
                items: ordersItems
            }).addStyleClass("sapUiSmallMargin");

            ordersTable.addItem(newTable);

            //Alternative way to show a dynamic table
            var newTableJson = new sap.m.Table();  
            newTableJson.setWidth("auto");
            newTableJson.addStyleClass("sapUiSmallMargin");

            var columnOrderId = new sap.m.Column();
            var labelOrderId = new sap.m.Label();
            labelOrderId.bindProperty("text", "i18n>orderId");  //Note - Bind to model not using {}
            columnOrderId.setHeader(labelOrderId);
            newTableJson.addColumn(columnOrderId);

            var columnFreight = new sap.m.Column();
            var labelFreight = new sap.m.Label();
            labelFreight.bindProperty("text", "i18n>freight");  //Note - Bind to model not using {}
            columnFreight.setHeader(labelFreight);
            newTableJson.addColumn(columnFreight);

            var columnShipAddress = new sap.m.Column();
            var labelShipAddress = new sap.m.Label();
            labelShipAddress.bindProperty("text", "i18n>shipAddress");  //Note - Bind to model not using {}
            columnShipAddress.setHeader(labelShipAddress);
            newTableJson.addColumn(columnShipAddress);

            var columnListItem = new sap.m.ColumnListItem();
            var cellOrderId = new sap.m.Label();
            cellOrderId.bindProperty("text", "jsonEmployees>OrderID")
            columnListItem.addCell(cellOrderId);

            var cellFreight = new sap.m.Label();
            cellFreight.bindProperty("text", "jsonEmployees>Freight")
            columnListItem.addCell(cellFreight);

            var cellShipAddress = new sap.m.Label();
            cellShipAddress.bindProperty("text", "jsonEmployees>ShipAddress")
            columnListItem.addCell(cellShipAddress);

            var oBindinginfo = {
                model: "jsonEmployees",
                path: "Orders",
                template: columnListItem
            };

            newTableJson.bindAggregation("items", oBindinginfo);
            newTableJson.bindElement("jsonEmployees>"+oBindingContext.getPath());

            ordersTable.addItem(newTableJson);
            */

        };

        //Close dialog
        function onCloseOrders(){
            this._oDialogOrders.close();
        };

        function showEmployee(oEvent){
            //Publish event to the event bus
            var path = oEvent.getSource().getBindingContext("jsonEmployees").getPath();
            this._bus.publish("flexible", "showEmployee", path);
        };

        var Main = Controller.extend("logaligroup.Employees.controller.MasterEmployee", {});

        Main.prototype.onValidate = function () {
            var inputEmployee = this.byId("inputEmployee");
            var valueEmployee = inputEmployee.getValue();

            if (valueEmployee.length === 6) {
                //inputEmployee.setDescription("OK");
                this.getView().byId("labelCountry").setVisible(true);
                this.getView().byId("slCountry").setVisible(true);
            } else {
                //inputEmployee.setDescription("Not OK");
                this.getView().byId("labelCountry").setVisible(false);
                this.getView().byId("slCountry").setVisible(false);
            }
        };

        Main.prototype.onInit = onInit;
        Main.prototype.onFilter = onFilter;
        Main.prototype.onClearFilter = onClearFilter;
        Main.prototype.onShowCity = onShowCity;
        Main.prototype.onHideCity = onHideCity;
        Main.prototype.showPostalCode = showPostalCode;
        Main.prototype.showOrders = showOrders;
        Main.prototype.onCloseOrders = onCloseOrders;
        Main.prototype.showEmployee = showEmployee;

        return Main;

    });
