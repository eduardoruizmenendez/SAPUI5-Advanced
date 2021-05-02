sap.ui.define([

],
    function () {
        function dateFormat(date) {

            var timeDay = 24 * 60 * 60 * 1000; //24 hours * 60 minutes * 60 seconds * 1000 miliseconds

            if (date) {
                var dateNow = new Date();
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy/MM/dd" });
                var dateNowFormat = new Date(dateFormat.format(dateNow));
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

                switch (true) {
                    //Today
                    case date.getTime() === dateNowFormat.getTime():
                        return oResourceBundle.getText("today");
                    //Yesterday
                    case date.getTime() === dateNowFormat.getTime() - timeDay:
                        return oResourceBundle.getText("yesterday");
                    //Tomorrow
                    case date.getTime() === dateNowFormat.getTime() + timeDay:
                        return oResourceBundle.getText("tomorrow");
                    default:
                        return "";
                }
            }

        }

        return {
            dateFormat: dateFormat
        }
    });