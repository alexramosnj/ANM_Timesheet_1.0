/*
    File name: ANM_Timesheet
    Author: Jesús Ramos
*/


/* ------------------------------------------- Controls' behavior ----------------------------------------------------*/

//Adds functions to form's buttons
$(document).ready(function () {

    $("#BtnAddRow").click(function () {
        $('#TblTimesheet').append('<tr name="TrTimesheetRow">'
            + '<td><input type="checkbox" name="ChkTimesheetSelectedRow" /></td>'
            + '<td><input type="text" id="TxtTimesheetProjectNameRow name="TxtTimesheetProjectNameRow class="form-control input-sm" onblur="RemoveAlert(); ValidateText(this);"/></td>'
            + '<td><input type="text" id="TxtTimesheetWorkDescriptionRow name="TxtTimesheetWorkDescriptionRow class="form-control input-sm" onblur="RemoveAlert(); ValidateText(this);"/></td>'
            + '<td><input type="number" min="0.5" step="0.5"  id="TxtTimesheetHoursWorkedRow name="TxtTimesheetHoursWorkedRow onkeyup = "ValidateHourWriting(this, event)" class="form-control input-sm" onblur="RemoveAlert(); ValidateHour(this);"/></td>'
            + '</tr>');
    });

    $("#BtnRemoveRows").click(function () {
        $('input:checkbox[name=ChkTimesheetSelectedRow]:checked').each(function () {
            $(this).closest('tr').remove();
        });
    });

    $("#BtnCancelTimesheet").click(function () {
        $("input").val("");
        $("input").each(function () {
            RemoveItemError(this);
        });
        $('#TblTimesheet tbody').empty();
        $('#BtnAddRow').click();
    });

    $("#BtnSubmitTimesheet").click(function () {
        ValidateForm();
    });

    //Adds a datepicket to the input "TxtDate"
    $("#TxtDate").datepicker();

});


/* ------------------------------------------- Control styles -------------------------------------------------------*/

//Sets appropiate styles to an specific item and its associated items in order to inform that this item is incorrect
function SetItemError(item) {
    var Alerta = "#SpnWarningSignal_" + $(item).attr("id");
    var Mensaje = "#SmlWarningMessage_" + $(item).attr("id");

    $(Alerta).removeClass();
    $(Mensaje).removeClass();
    $(Alerta).addClass("warningsignal");
    $(Mensaje).addClass("warningmessage");
    $(item).addClass("inputerror");
}

//Resets the initial style of an input and its associated elements if it has no errors
function RemoveItemError(item) {
    var Alerta = "#SpnWarningSignal_" + $(item).attr("id");
    var Mensaje = "#SmlWarningMessage_" + $(item).attr("id");

    $(Alerta).removeClass();
    $(Mensaje).removeClass();
    $(Mensaje).addClass("nonewarningmessage");
    $(item).removeClass("inputerror");
}

//Hides the main message displayed by the application 
function RemoveAlert() {
    $("#DivAlertSubmit").removeClass();
    $("#LblAlertSubmit").text("");
}


/* ------------------------------------------- Validations ---------------------------------------------------------*/

//Finds errors in the inputs, if it doesn't find an error then it launch the "SendEmail function", else it shows errors
function ValidateForm() {
    RemoveAlert();
    var error = false;
    $("input[type=text],input[type=email], input[type=number]").each(function () {
        if ($(this).val() != "") {
            if (this.type == "text") {
                $(this).removeClass("inputerror");
                RemoveItemError(this);
            }
            else {
                switch (this.type)
                {
                    case "email":
                        if (!ValidateEmail(this)) { error = true;};
                        break;
   
                    case "number": 
                        if (!ValidateHour(this)) { error = true;};
                        break;
   
                    default: break;
                }
            }

        }
        else {
            $(this).addClass("inputerror");
            SetItemError(this);
            error = true;
        }
    });

    if (!error) {
        SendEmail();
    }
    else {
        $("#DivAlertSubmit").addClass("alert alert-danger alert-dismissible submitalertdanger");
        $("#LblAlertSubmit").text("One or more required fields are either blank or incorrect.");
    }
}

//Verifies if the text within in an input is a correct email address
function ValidateEmail(item) {
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(item.value)) {
        RemoveItemError(item);
        return (true);
    }
    else {
        SetItemError(item);
        return (false);
    }
}

//Verifies if the text within in an input is a correct. The text can be only hours and half hours in a range of 0.5 to 24 hours
function ValidateHour(item) {
    if (/^\d+(.5*)?$/.test(item.value) && item.value > 0 && item.value <= 24) {
        RemoveItemError(item);
        return (true);
    }
    else {
        SetItemError(item);
        return (false);
    }
}

//Verifies if the text is null. There is no necessary to verify a regular expression for this type of input
function ValidateText(item) {
    if (item.value == "" || item.value == null) {
        SetItemError(item);
    }
    else {
        RemoveItemError(item);
    }
}

//Verifies is the typed key is a number or dot
function ValidateHourWriting(item, event) {
    if ((event.keyCode < 37 || event.keyCode > 40) && event.keyCode != 8 && event.keyCode != 46) {
        return false;
    }
}


/* ------------------------------------------- Email: Using Mandrill API ------------------------------------------*/

//Sends an email with the timesheet and personal data to a specific email address
function SendEmail() {
    mandrill_client = new mandrill.Mandrill('foVFRGC-dAmYUGlSnh3fow');

    // create variables for the API call parameters
    var HtmlBody = "";
    HtmlBody += "<br />Hi Alex, <br /><br />";

    HtmlBody += "This is my timesheet for: <b>" + $("#TxtDate").val() + "</b><br /><br />";
    HtmlBody += CopyTable() + "<br /><br />";
    HtmlBody += "Best regards <br />" + $("#TxtName").val() + "<br />";
    HtmlBody += "Email: " + $("#TxtEmailAddress").val();


    var message = {
        "html": HtmlBody,
        "text": "Timesheet",
        "subject": "Timesheet ANM",
        "from_email": "alexramosnj@simva.com.mx",
        "from_name": "ANM",
        "to": [{
            "email": "alexramosnj@gmail.com",
            "name": "Alejandro Ramos",
            "type": "to"
        }],
        "headers": {
            "Reply-To": $("#TxtEmailAddress").val()
        },
    };
    var async = false;
    var ip_pool = "Main Pool";
    var send_at = "July 21, 1983 01:15:00";

    mandrill_client.messages.send({
        "message": message,
        "async": async,
        "ip_pool": ip_pool,
        "send_at": send_at,
        "signing_domain": "simva.com.mx"
    }, function (result) {
        if (result[0].status == 'sent') {
            $("#DivAlertSubmit").addClass("alert alert-danger submitalertsuccess");
            $("#LblAlertSubmit").text("Your timesheet has been sent successfully.");
            $("input").val("");
            $('#TblTimesheet tbody').empty();
            $('#BtnAddRow').click();
        }
        else {
            $("#DivAlertSubmit").addClass("alert alert-danger submitalertdanger");
            $("#LblAlertSubmit").text("Sorry, your timesheet could not be sent. \n Please check your information and try again.");
        }
        
    }, function (e) {
        // Mandrill returns the error as an object with name and message keys
        $("#DivAlertSubmit").addClass("alert alert-danger submitalertdanger");
        $("#LblAlertSubmit").text("Sorry an error occurred. \n Please check your information and try again.");
    });
}

//Copies the timesheet from form to the email content
function CopyTable() {
    var TxtTable = ""
    TxtTable += "<table><thead><tr><th>Project name</th><th>Work description</th><th>Hours worked</th></tr></thead>";
    TxtTable += "<tbody>";

    $("#TblTimesheet tbody tr").each(function (index) {        
        TxtTable += "<tr>"
        $(this).find("input[type=text],input[type=number]").each(function (index2) {
            TxtTable += "<td>" + $(this).val() + "</td>";
        })
        TxtTable += "</tr>";
    })
    TxtTable += "</tbody></table>";
    return TxtTable;
}