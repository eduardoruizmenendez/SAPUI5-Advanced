// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * 
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     * @param {typeof sap.ui.core.routing.History} History
     * @param {typeof sap.m.MessageBox} MessageBox
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */
    function (Controller, History, MessageBox, Filter, FilterOperator) {

        function _onObjectMatched(oEvent) {

            this.onClearSignature();    //Clear the content of the signature pad

            const contextPath = "/Orders(" + oEvent.getParameter("arguments").OrderID + ")";

            this.getView().bindElement({
                path: contextPath,
                model: "odataNorthwind",
                events: {
                    //Event to wait for the model to be read
                    dataReceived: function (oData) {
                        _readDependencies.bind(this)(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID);
                    }.bind(this)
                }
            });

            const objContext = this.getView().getModel("odataNorthwind").getContext(contextPath).getObject();
            if (objContext !== undefined) {
                _readDependencies.bind(this)(objContext.OrderID, objContext.EmployeeID);
            };

        };

        function _readDependencies(orderId, employeeId) {

            //Read signature image
            this.getView().getModel("incidenceModel").read("/SignatureSet(OrderId='" + orderId
                + "',SapId='" + this.getOwnerComponent().SapId
                + "',EmployeeId='" + employeeId + "')", {
                success: function (data) {
                    const signature = this.getView().byId("signature");
                    if (data.MediaContent !== "") {
                        signature.setSignature("data:image/png;base64," + data.MediaContent);
                    };
                }.bind(this),
                error: function (data) {

                }
            });

            //Bind files
            this.getView().byId("uploadCollection").bindAggregation("items", {
                path: "incidenceModel>/FilesSet",
                filters: [
                    new Filter("OrderId", FilterOperator.EQ, orderId),
                    new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
                    new Filter("EmployeeId", FilterOperator.EQ, employeeId)
                ],
                template: new sap.m.UploadCollectionItem({
                    documentId: "{incidenceModel>AttId}",
                    visibleEdit: false,
                    fileName: "{incidenceModel>FileName}"
                }).attachPress(this.downloadFile)
            });

        };

        return Controller.extend("logaligroup.Employees.controller.OrderDetails", {

            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);
            },

            onBack: function (oEvent) {

                let oHistory = History.getInstance();
                let sPreviousHash = oHistory.getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.go(-1);
                } else {
                    let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteMain", true);
                }
            },

            onClearSignature: function (oEvent) {
                let signature = this.getView().byId("signature");
                if (signature !== undefined) {
                    signature.clear();
                }
            },

            factoryOrderDetails: function (listId, oContext) {

                let contextObject = oContext.getObject();
                contextObject.Currency = "EUR";
                let unitsInStock = oContext.getModel().getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock");

                if (contextObject.Quantity <= unitsInStock) {
                    let oListItem = new sap.m.ObjectListItem({
                        title: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
                        number: "{parts: [ { path : 'odataNorthwind>UnitPrice'}, { path : 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency', formatOptions: {showMeasure : false}}",
                        numberUnit: "{odataNorthwind>Currency}"
                    });
                    return oListItem;
                } else {
                    let oCustomListItem = new sap.m.CustomListItem({
                        content: [
                            new sap.m.Bar({
                                contentLeft: new sap.m.Label({ text: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})" }),
                                contentMiddle: new sap.m.ObjectStatus({ text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: "Error" }),
                                contentRight: new sap.m.Label({ text: "{parts: [ { path : 'odataNorthwind>UnitPrice'}, { path : 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency'}" })
                            })
                        ]
                    });
                    return oCustomListItem;
                }

            },

            onSaveSignature(oEvent) {
                const signature = this.getView().byId("signature");
                const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                let signaturePng;

                if (signature.isFilled()) {
                    //signature.getSignature() = "data:image/png;base64,,<<<hexadecimal content>>>"
                    signaturePng = signature.getSignature().replace("data:image/png;base64,", "");

                    let objectOrder = oEvent.getSource().getBindingContext("odataNorthwind").getObject();
                    let body = {
                        OrderId: objectOrder.OrderID.toString(),
                        SapId: this.getOwnerComponent().SapId,
                        EmployeeId: objectOrder.EmployeeID.toString(),
                        MimeType: "image/png",
                        MediaContent: signaturePng
                    };

                    this.getView().getModel("incidenceModel").create("/SignatureSet", body, {
                        success: function () {
                            MessageBox.success(oResourceBundle.getText("signatureSaved"));
                        },
                        error: function () {
                            MessageBox.error(oResourceBundle.getText("signatureNotSaved"));
                        }
                    });

                } else {
                    MessageBox.error(oResourceBundle.getText("fillSignature"));
                };

            },

            onFileBeforeUpload: function (oEvent) {

                let fileName = oEvent.getParameter("fileName");
                let oContext = oEvent.getSource().getBindingContext("odataNorthwind").getObject();

                let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                    name: "slug",
                    value: oContext.OrderID + ";"
                        + this.getOwnerComponent().SapId + ";"
                        + oContext.EmployeeID + ";"
                        + fileName
                });

                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

            },

            onFileChange: function (oEvent) {

                let oUploadCollection = oEvent.getSource();

                //Header Token CSRF - Cross-site request forgery
                let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: this.getView().getModel("incidenceModel").getSecurityToken()
                });

                oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

            },

            onFileUploadComplete: function (oEvent) {

                oEvent.getSource().getBinding("items").refresh();

            },

            onFileDeleted: function (oEvent) {

                let oUploadCollection = oEvent.getSource();
                let sPath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath();

                this.getView().getModel("incidenceModel").remove(sPath, {
                    success: function () {
                        oUploadCollection.getBinding("items").refresh();
                    },

                    error: function () { }

                });

            },

            downloadFile: function (oEvent) {

                const sPath = oEvent.getSource().getBindingContext("incidenceModel").getPath();
                window.open("sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value");

            }

        });

    }
);