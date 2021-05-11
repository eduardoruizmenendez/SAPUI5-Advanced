// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",

],
    /**
     * 
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     */
    function (Controller) {

        return Controller.extend("logaligroup.Employees.controller.Base", {

            onInit: function () {
            },

            toOrderDetails: function (oEvent) {
                let orderId = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);   //get router initialized in Component.js
                oRouter.navTo("RouteOrderDetails", {
                    OrderID: orderId
                });
            }

        });

    });