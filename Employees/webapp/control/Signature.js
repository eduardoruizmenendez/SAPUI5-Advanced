// @ts-nocheck
sap.ui.define([
    "sap/ui/core/Control",

],
    /**
     * 
     * @param {typeof sap.ui.core.Control} Control
     */
    function (Control) {

        return Control.extend("logaligroup.Employees.control.Signature", {

            metadata: {
                properties: {
                    "width": {
                        type: "sap.ui.core.CSSSize",
                        defaultValue: "400px"
                    },
                    "height": {
                        type: "sap.ui.core.CSSSize",
                        defaultValue: "100px"
                    },
                    "bgcolor": {
                        type: "sap.ui.core.CSSColor",
                        defaultValue: "white"
                    }
                }

            },

            onInit: function () {
            },

            renderer: function (oRenderManager, oControl) {
                oRenderManager.write("<div");
                oRenderManager.addStyle("width", oControl.getProperty("width"));
                oRenderManager.addStyle("height", oControl.getProperty("height"));
                oRenderManager.addStyle("background-color", oControl.getProperty("bgcolor"));
                oRenderManager.addStyle("border", "1px solid black");
                oRenderManager.writeStyles();
                oRenderManager.write(">");
                oRenderManager.write("<canvas width='" + oControl.getProperty("width") + "' "
                                           + "height='" + oControl.getProperty("height") + "'");
                oRenderManager.write("></canvas>");
                oRenderManager.write("</div>");
            },

            onAfterRendering: function () {
                let canvas = document.querySelector("canvas");
                try {
                    this.signaturePad = new SignaturePad(canvas)
                } catch (e) {
                    console.error(e);
                }

            },

            clear: function(){
                this.signaturePad.clear();
            }

        });

    });