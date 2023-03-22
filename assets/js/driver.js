let transAry = [];
let driverAry = [];
let isTransEdit = false;
let isDriverEdit = false;
let driver_id = null;
let trans_id = null;
let selectedTrans = {};
let selectedDriver = {};
const encryptedPwd = localStorage.getItem('enc_key');
let pwd = decrypt(encryptedPwd, "system-key");

/**
 * Date Format function
 * @param {Date} dateval 
 * @param {Number} type // if 2, yyyy-mm-dd. if 3, 2011-10-05T14:48:00.000Z
 * @returns formated date string
 */
const dateFormat = (dateval, type = 0) => {
    const date = new Date(dateval);
    year = date.getFullYear();
    month = date.getMonth() + 1;
    dt = date.getDate();
    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }
    if (type === 3) {
        return date.toISOString();
    }
    if (type === 2) {
        return year + "-" + month + "-" + dt;
    }
    return month + "/" + dt + "/" + year;
}

/**
 * Format Function
 * @param {Boolean} flag 
 */
const formatTransVals = (flag) => {
    if (flag) {
        isTransEdit = true;
        $("#transEditCancel").show();
        $("#transSave").text("Edit");
    } else {
        isTransEdit = false;
        $("#transEditCancel").hide();
        $("#transSave").text("Add");
        $("#trans_date").val("");
        $("#trans_num").val("");
        $("#trans_comment").val("");
    }
}

const formatDriverVals = (flag) => {
    if (flag) {
        isDriverEdit = true;
        $("#addDriverModal .modal-title").text("Edit Driver");
        $("save_driver").text("Save");
    } else {
        isDriverEdit = false;
        $("#addDriverModal .modal-title").text("Add New Driver");
        $("save_driver").text("Add Driver");
        $("#address").val("");
        $("#dob").val("");
        $("#cell_phone").val("");
        $("#city").val("");
        $("#comments").val("");
        $("#driver_license").val("");
        $("#full_name").val("");
        $("#hire_date").val("");
        $("#home_phone").val("");
        $("#ssn").val("");
        $("#state").val("");
        $("#zip").val("");
    }
}

/**
 * onlick when transaction edit button
 * @param {Number} transId // transaction id
 */
const editTrans = (transId) => {
    trans_id = transId;
    const ind = transAry.findIndex(x => x.id === transId);
    selectedTrans = transAry[ind];
    $("#trans_date").val(dateFormat(selectedTrans['date'], 2));
    $("#trans_num").val(selectedTrans['trans']);
    $("#trans_comment").val(selectedTrans['comments']);

    formatTransVals(true);
}

/**
 * Delete transaction
 * @param {Number} transId 
 * @param {Number} trans 
 * @param {Number} driverId 
 */
const deleteTrans = (transId, trans, driverId) => {
    if (!confirm("Are you sure you want to delete ?")) return;

    const delData = {
        id: transId,
        driver_id: driverId,
        trans
    }
    $.ajax({
        url: "/api/v1/transactions/delete",
        type: "POST",
        dataType: "json",
        data: JSON.stringify(delData),
        contentType: "application/json",
        success: function (response) {
            $("#transaction_table tr[rid='" + transId + "']").remove();
            // getTransactions(driverId);
        },
        error: function (xhr, status, err) {
            toastr.error(err, status);
        }
    });
}

/**
 * the function for getting transactions
 * @param {Number} driverId // driver id
 */
const getTransactions = (driverId) => {
    $.ajax({
        url: `/api/v1/transactions/${driverId}`,
        type: "GET",
        dataType: "json",
        success: function (res) {
            const rows = res.data;
            transAry = rows;
            let trs = "";
            if (rows.length > 0) {
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    trs += `<tr rid="${row['id']}">
                    <td>${dateFormat(row['date'])}</td>
                    <td>${row['trans']}</td>
                    <td>${row['balance']}</td>
                    <td>${row['comments']}</td>
                    <td class="text-right">
                        <a href="javascript::void(0);" onclick="editTrans(${row['id']})" class="px-1">
                            <svg width="21" height="21" viewBox="0 0 21 21" fill="none"
                                xmlns="http://www.w3.org/2000/svg" class="sc-kDvujY kmlQA">
                                <path
                                    d="M16.8875 7.80938L13.1688 4.13437L14.3938 2.90938C14.7292 2.57396 15.1413 2.40625 15.6301 2.40625C16.1184 2.40625 16.5302 2.57396 16.8656 2.90938L18.0906 4.13437C18.426 4.46979 18.601 4.87462 18.6156 5.34887C18.6302 5.82254 18.4698 6.22708 18.1344 6.5625L16.8875 7.80938ZM3.5 18.375C3.25208 18.375 3.04442 18.291 2.877 18.123C2.709 17.9556 2.625 17.7479 2.625 17.5V15.0281C2.625 14.9115 2.64688 14.7986 2.69063 14.6895C2.73438 14.5798 2.8 14.4813 2.8875 14.3938L11.9 5.38125L15.6188 9.1L6.60625 18.1125C6.51875 18.2 6.42046 18.2656 6.31137 18.3094C6.20171 18.3531 6.08854 18.375 5.97187 18.375H3.5Z"
                                    fill="#C0C0C0"></path>
                            </svg>
                        </a>
                        <a href="javascript::void(0);" onclick="deleteTrans(${row['id']}, ${row['trans']}, ${row['driver_id']})" class="px-1">
                            <svg width="23" height="21" viewBox="0 0 23 21" fill="none"
                                xmlns="http://www.w3.org/2000/svg" class="sc-kDvujY kmlQA">
                                <path
                                    d="M19.4062 3.9375H15.0938V2.95312C15.0938 2.518 14.9044 2.1007 14.5675 1.79303C14.2305 1.48535 13.7734 1.3125 13.2969 1.3125H9.70312C9.22656 1.3125 8.76952 1.48535 8.43254 1.79303C8.09556 2.1007 7.90625 2.518 7.90625 2.95312V3.9375H3.59375C3.40313 3.9375 3.22031 4.00664 3.08552 4.12971C2.95073 4.25278 2.875 4.4197 2.875 4.59375C2.875 4.7678 2.95073 4.93472 3.08552 5.05779C3.22031 5.18086 3.40313 5.25 3.59375 5.25H4.35742L5.21094 17.7565C5.27473 18.8578 6.19922 19.6875 7.36719 19.6875H15.6328C16.8066 19.6875 17.7127 18.8762 17.7891 17.7598L18.6426 5.25H19.4062C19.5969 5.25 19.7797 5.18086 19.9145 5.05779C20.0493 4.93472 20.125 4.7678 20.125 4.59375C20.125 4.4197 20.0493 4.25278 19.9145 4.12971C19.7797 4.00664 19.5969 3.9375 19.4062 3.9375ZM8.65061 17.0625H8.625C8.43873 17.0626 8.25969 16.9967 8.12561 16.8786C7.99153 16.7606 7.91289 16.5996 7.90625 16.4296L7.54688 7.24213C7.54008 7.06808 7.6093 6.8987 7.73929 6.77124C7.86928 6.64379 8.04939 6.5687 8.24002 6.5625C8.43064 6.5563 8.61616 6.61949 8.75575 6.73818C8.89535 6.85687 8.97758 7.02132 8.98438 7.19537L9.34375 16.3829C9.34717 16.4691 9.33195 16.555 9.29896 16.6358C9.26597 16.7167 9.21585 16.7908 9.15148 16.8539C9.0871 16.917 9.00973 16.9679 8.92379 17.0037C8.83784 17.0395 8.74501 17.0595 8.65061 17.0625ZM12.2188 16.4062C12.2188 16.5803 12.143 16.7472 12.0082 16.8703C11.8734 16.9934 11.6906 17.0625 11.5 17.0625C11.3094 17.0625 11.1266 16.9934 10.9918 16.8703C10.857 16.7472 10.7812 16.5803 10.7812 16.4062V7.21875C10.7812 7.0447 10.857 6.87778 10.9918 6.75471C11.1266 6.63164 11.3094 6.5625 11.5 6.5625C11.6906 6.5625 11.8734 6.63164 12.0082 6.75471C12.143 6.87778 12.2188 7.0447 12.2188 7.21875V16.4062ZM13.6562 3.9375H9.34375V2.95312C9.34321 2.9099 9.35213 2.86701 9.37 2.82697C9.38787 2.78694 9.41432 2.75057 9.4478 2.72C9.48128 2.68943 9.52111 2.66528 9.56496 2.64897C9.60881 2.63265 9.65578 2.62451 9.70312 2.625H13.2969C13.3442 2.62451 13.3912 2.63265 13.435 2.64897C13.4789 2.66528 13.5187 2.68943 13.5522 2.72C13.5857 2.75057 13.6121 2.78694 13.63 2.82697C13.6479 2.86701 13.6568 2.9099 13.6562 2.95312V3.9375ZM15.0938 16.4296C15.0871 16.5996 15.0085 16.7606 14.8744 16.8786C14.7403 16.9967 14.5613 17.0626 14.375 17.0625H14.3489C14.2546 17.0594 14.1618 17.0394 14.0759 17.0036C13.99 16.9678 13.9127 16.9169 13.8484 16.8537C13.784 16.7906 13.734 16.7165 13.701 16.6358C13.668 16.555 13.6528 16.469 13.6562 16.3829L14.0156 7.19537C14.019 7.10919 14.0409 7.02446 14.0801 6.94601C14.1194 6.86757 14.1751 6.79695 14.2442 6.73818C14.3134 6.67941 14.3945 6.63365 14.483 6.60351C14.5715 6.57336 14.6656 6.55943 14.76 6.5625C14.8544 6.56557 14.9472 6.58558 15.0331 6.6214C15.119 6.65722 15.1964 6.70813 15.2607 6.77124C15.3251 6.83435 15.3752 6.90842 15.4082 6.98921C15.4412 7.07001 15.4565 7.15595 15.4531 7.24213L15.0938 16.4296Z"
                                    fill="#C0C0C0"></path>
                            </svg>
                        </a>
                    </td>
                </tr>`;
                }
            }
            $(".transactions-list").html(trs);

            $('#transaction_table').DataTable({
                retrieve: true,
                paging: false,
                ordering: false,
                info: false,
            });
        },
        error: function (xhr, status, err) {
            toastr.error(err, status);
        }
    });
}

const deleteDriver = (driverId) => {
    if (!confirm("Are you sure you want to delete ?")) return;

    $.ajax({
        url: `/api/v1/drivers/${driverId}`,
        type: "DELETE",
        success: function (response) {
            // getDrivers();
            $("#driver_table tr[rid='" + driverId + "']").remove();
        },
        error: function (xhr, status, err) {
            toastr.error(err, status);
        }
    });
}

/**
 * open modal of the transactions history
 * @param {Number} driverId // driver id
 */
const showTransModal = (driverId) => {
    driver_id = driverId;
    getTransactions(driverId);

    formatTransVals(false);
    $("#transactionModal").modal('toggle');
}

/**
 * open modal of the editting driver
 * @param {Number} driverId // driver id
 */
const editDriverModal = (driverId) => {
    const ind = driverAry.findIndex(x => x.id === driverId);
    selectedDriver = driverAry[ind];
    $("#address").val(decrypt(selectedDriver.adress, pwd));
    $("#dob").val(decrypt(selectedDriver.birthday, pwd));
    $("#cell_phone").val(decrypt(selectedDriver.cell_phone, pwd));
    $("#city").val(decrypt(selectedDriver.city, pwd));
    $("#comments").val(selectedDriver.comments);
    $("#driver_license").val(decrypt(selectedDriver.driver_license, pwd));
    $("#full_name").val(decrypt(selectedDriver.full_name, pwd));
    $("#hire_date").val(decrypt(selectedDriver.hire_date, pwd));
    $("#home_phone").val(decrypt(selectedDriver.home_phone, pwd));
    $("#ssn").val(decrypt(selectedDriver.ss, pwd));
    $("#state").val(decrypt(selectedDriver.state_text, pwd));
    $("#zip").val(decrypt(selectedDriver.state_zip, pwd));

    formatDriverVals(true);
    $("#driverModal").modal('toggle');
}

const drawTable = (rows)=>{
    let trs = "";
    if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            trs += `<tr rid="${row['id']}">
                <td>${decrypt(row['full_name'], pwd)}</th>
                <td>${row['balance']}</td>
                <td>${row['comments']}</td>
                <td class="text-right">
                    <a href="javascript::void(0);" onclick="showTransModal(${row['id']})" class="px-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg" class="sc-kDvujY kmlQA">
                            <path
                                d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM8.5 14V16H11V18H13V16H14C14.663 16 15.2989 15.7366 15.7678 15.2678C16.2366 14.7989 16.5 14.163 16.5 13.5C16.5 12.837 16.2366 12.2011 15.7678 11.7322C15.2989 11.2634 14.663 11 14 11H10C9.86739 11 9.74021 10.9473 9.64645 10.8536C9.55268 10.7598 9.5 10.6326 9.5 10.5C9.5 10.3674 9.55268 10.2402 9.64645 10.1464C9.74021 10.0527 9.86739 10 10 10H15.5V8H13V6H11V8H10C9.33696 8 8.70107 8.26339 8.23223 8.73223C7.76339 9.20107 7.5 9.83696 7.5 10.5C7.5 11.163 7.76339 11.7989 8.23223 12.2678C8.70107 12.7366 9.33696 13 10 13H14C14.1326 13 14.2598 13.0527 14.3536 13.1464C14.4473 13.2402 14.5 13.3674 14.5 13.5C14.5 13.6326 14.4473 13.7598 14.3536 13.8536C14.2598 13.9473 14.1326 14 14 14H8.5Z"
                                fill="#C0C0C0"></path>
                        </svg>
                    </a>
                    <a href="javascript::void(0);" onclick="editDriverModal(${row['id']})" class="px-1">
                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none"
                            xmlns="http://www.w3.org/2000/svg" class="sc-kDvujY kmlQA">
                            <path
                                d="M16.8875 7.80938L13.1688 4.13437L14.3938 2.90938C14.7292 2.57396 15.1413 2.40625 15.6301 2.40625C16.1184 2.40625 16.5302 2.57396 16.8656 2.90938L18.0906 4.13437C18.426 4.46979 18.601 4.87462 18.6156 5.34887C18.6302 5.82254 18.4698 6.22708 18.1344 6.5625L16.8875 7.80938ZM3.5 18.375C3.25208 18.375 3.04442 18.291 2.877 18.123C2.709 17.9556 2.625 17.7479 2.625 17.5V15.0281C2.625 14.9115 2.64688 14.7986 2.69063 14.6895C2.73438 14.5798 2.8 14.4813 2.8875 14.3938L11.9 5.38125L15.6188 9.1L6.60625 18.1125C6.51875 18.2 6.42046 18.2656 6.31137 18.3094C6.20171 18.3531 6.08854 18.375 5.97187 18.375H3.5Z"
                                fill="#C0C0C0"></path>
                        </svg>
                    </a>
                    <a href="javascript::void(0);" onClick="deleteDriver(${row['id']})" class="px-1">
                        <svg width="23" height="21" viewBox="0 0 23 21" fill="none"
                            xmlns="http://www.w3.org/2000/svg" class="sc-kDvujY kmlQA">
                            <path
                                d="M19.4062 3.9375H15.0938V2.95312C15.0938 2.518 14.9044 2.1007 14.5675 1.79303C14.2305 1.48535 13.7734 1.3125 13.2969 1.3125H9.70312C9.22656 1.3125 8.76952 1.48535 8.43254 1.79303C8.09556 2.1007 7.90625 2.518 7.90625 2.95312V3.9375H3.59375C3.40313 3.9375 3.22031 4.00664 3.08552 4.12971C2.95073 4.25278 2.875 4.4197 2.875 4.59375C2.875 4.7678 2.95073 4.93472 3.08552 5.05779C3.22031 5.18086 3.40313 5.25 3.59375 5.25H4.35742L5.21094 17.7565C5.27473 18.8578 6.19922 19.6875 7.36719 19.6875H15.6328C16.8066 19.6875 17.7127 18.8762 17.7891 17.7598L18.6426 5.25H19.4062C19.5969 5.25 19.7797 5.18086 19.9145 5.05779C20.0493 4.93472 20.125 4.7678 20.125 4.59375C20.125 4.4197 20.0493 4.25278 19.9145 4.12971C19.7797 4.00664 19.5969 3.9375 19.4062 3.9375ZM8.65061 17.0625H8.625C8.43873 17.0626 8.25969 16.9967 8.12561 16.8786C7.99153 16.7606 7.91289 16.5996 7.90625 16.4296L7.54688 7.24213C7.54008 7.06808 7.6093 6.8987 7.73929 6.77124C7.86928 6.64379 8.04939 6.5687 8.24002 6.5625C8.43064 6.5563 8.61616 6.61949 8.75575 6.73818C8.89535 6.85687 8.97758 7.02132 8.98438 7.19537L9.34375 16.3829C9.34717 16.4691 9.33195 16.555 9.29896 16.6358C9.26597 16.7167 9.21585 16.7908 9.15148 16.8539C9.0871 16.917 9.00973 16.9679 8.92379 17.0037C8.83784 17.0395 8.74501 17.0595 8.65061 17.0625ZM12.2188 16.4062C12.2188 16.5803 12.143 16.7472 12.0082 16.8703C11.8734 16.9934 11.6906 17.0625 11.5 17.0625C11.3094 17.0625 11.1266 16.9934 10.9918 16.8703C10.857 16.7472 10.7812 16.5803 10.7812 16.4062V7.21875C10.7812 7.0447 10.857 6.87778 10.9918 6.75471C11.1266 6.63164 11.3094 6.5625 11.5 6.5625C11.6906 6.5625 11.8734 6.63164 12.0082 6.75471C12.143 6.87778 12.2188 7.0447 12.2188 7.21875V16.4062ZM13.6562 3.9375H9.34375V2.95312C9.34321 2.9099 9.35213 2.86701 9.37 2.82697C9.38787 2.78694 9.41432 2.75057 9.4478 2.72C9.48128 2.68943 9.52111 2.66528 9.56496 2.64897C9.60881 2.63265 9.65578 2.62451 9.70312 2.625H13.2969C13.3442 2.62451 13.3912 2.63265 13.435 2.64897C13.4789 2.66528 13.5187 2.68943 13.5522 2.72C13.5857 2.75057 13.6121 2.78694 13.63 2.82697C13.6479 2.86701 13.6568 2.9099 13.6562 2.95312V3.9375ZM15.0938 16.4296C15.0871 16.5996 15.0085 16.7606 14.8744 16.8786C14.7403 16.9967 14.5613 17.0626 14.375 17.0625H14.3489C14.2546 17.0594 14.1618 17.0394 14.0759 17.0036C13.99 16.9678 13.9127 16.9169 13.8484 16.8537C13.784 16.7906 13.734 16.7165 13.701 16.6358C13.668 16.555 13.6528 16.469 13.6562 16.3829L14.0156 7.19537C14.019 7.10919 14.0409 7.02446 14.0801 6.94601C14.1194 6.86757 14.1751 6.79695 14.2442 6.73818C14.3134 6.67941 14.3945 6.63365 14.483 6.60351C14.5715 6.57336 14.6656 6.55943 14.76 6.5625C14.8544 6.56557 14.9472 6.58558 15.0331 6.6214C15.119 6.65722 15.1964 6.70813 15.2607 6.77124C15.3251 6.83435 15.3752 6.90842 15.4082 6.98921C15.4412 7.07001 15.4565 7.15595 15.4531 7.24213L15.0938 16.4296Z"
                                fill="#C0C0C0"></path>
                        </svg>
                    </a>
                </td>
            </tr>`;
        }
    }
    $(".driver-list").html(trs);

    $('#driver_table').DataTable({
        retrieve: true,
        select: true,
        info: false,
        columnDefs: [
            { "orderable": false, "targets": 3 }
        ],
        pageLength: 10,
        order: [[ 3, 'asc' ]]
    });
}

const getDrivers = () => {
    $.ajax({
        url: "/api/v1/drivers",
        type: "GET",
        dataType: "json",
        success: function (res) {
            const rows = res.data;
            driverAry = rows;
            drawTable(rows)
        },
        error: function (xhr, status, err) {
            toastr.error(err, status);
        }
    });
}

const validationDrivers = () => {
    if(!$("#full_name").val()) {
        toastr.warning("Full Name is empty", "Required Field");
        return true;
    }
    if(!$("#address").val()) {
        toastr.warning("Address is empty", "Required Field");
        return true;
    }
    if(!$("#city").val()) {
        toastr.warning("City is empty", "Required Field");
        return true;
    }
    if(!$("#state").val()) {
        toastr.warning("State is empty", "Required Field");
        return true;
    }
    if(!$("#zip").val()) {
        toastr.warning("Zip is empty", "Required Field");
        return true;
    }
    if(!$("#home_phone").val()) {
        toastr.warning("Home Phone is empty", "Required Field");
        return true;
    }
    if(!$("#cell_phone").val()) {
        toastr.warning("Cell Phone is empty", "Required Field");
        return true;
    }
    if(!$("#driver_license").val()) {
        toastr.warning("Driver License is empty", "Required Field");
        return true;
    }
    if(!$("#ssn").val()) {
        toastr.warning("SSN is empty", "Required Field");
        return true;
    }
    if(!$("#dob").val()) {
        toastr.warning("DOB is empty", "Required Field");
        return true;
    }
    if(!$("#hire_date").val()) {
        toastr.warning("Hire Date is empty", "Required Field");
        return true;
    }
    if(!$("#comments").val()) {
        toastr.warning("Comments is empty", "Required Field");
        return true;
    }
}

const validationTrans = () => {
    if(!$("#trans_date").val()) {
        toastr.warning("Date is empty", "Required Field");
        return true;
    }
    if(!$("#trans_num").val()) {
        toastr.warning("Transaction is empty", "Required Field");
        return true;
    }
    if(!$("#trans_comment").val()) {
        toastr.warning("Comments is empty", "Required Field");
        return true;
    }
}

$(document).ready(function () {
    // with initializing, getting driver data and drawing the driver table
    getDrivers();

    // open modal of adding a new driver 
    $("#addNewDriverModal").click(() => {
        formatDriverVals(false);
        $("#driverModal").modal('toggle');
    })

    // transaction edit cancel
    $("#transEditCancel").click(() => {
        formatTransVals(false);
    })

    // Save transaction
    $("#transSave").click(() => {
        if(validationTrans()) return;

        const newData = {
            date: dateFormat($("#trans_date").val(), 3),
            trans: $("#trans_num").val() * 1,
            comments: $("#trans_comment").val(),
            driver_id: driver_id,
        }
        let editData = {};

        if (isTransEdit) {
            editData = {
                ...selectedTrans,
                date: newData.date,
                trans: newData.trans,
                comments: newData.comments,
                different: selectedTrans.trans - newData.trans
            }
        }

        $.ajax({
            url: "/api/v1/transactions",
            type: isTransEdit ? "PATCH" : "POST",
            dataType: "json",
            data: JSON.stringify(isTransEdit ? editData : newData),
            contentType: "application/json",
            success: function (response) {
                getTransactions(driver_id);
                formatTransVals(false);
            },
            error: function (xhr, status, err) {
                toastr.error(err, status);
            }
        });
    })

    // Save driver
    $("#save_driver").click(() => {
        if(validationDrivers()) return;

        const newData = {
            adress: encrypt($("#address").val(), pwd),
            birthday: $("#dob").val(),
            cell_phone: encrypt($("#cell_phone").val(), pwd),
            city: encrypt($("#city").val(), pwd),
            comments: $("#comments").val(),
            driver_license: encrypt($("#driver_license").val(), pwd),
            full_name: encrypt($("#full_name").val(), pwd),
            hire_date: encrypt($("#hire_date").val(), pwd),
            home_phone: encrypt($("#home_phone").val(), pwd),
            ss: encrypt($("#ssn").val(), pwd),
            state_text: encrypt($("#state").val(), pwd),
            state_zip: encrypt($("#zip").val(), pwd),
            is_active: $('#driver_active').is(":checked") ? 1 : 0,
        }
        let editData = {};
        if(isDriverEdit){
            editData = {
                ...selectedDriver,
                ...newData,
            }
        }

        $.ajax({
            url: "/api/v1/drivers",
            type: isDriverEdit ? "PATCH" : "POST",
            dataType: "json",
            data: JSON.stringify(isDriverEdit ? editData : newData),
            contentType: "application/json",
            success: function (response) {
                $("#driverModal").modal('toggle');
                getDrivers();
                formatDriverVals(false);
            },
            error: function (xhr, status, err) {
                toastr.error(err, status);
            }
        });
    });
    
    $("#is_active").click(()=>{
        const isActive = $('#is_active').is(":checked") ? 1 : 0;
        const filteredDrivers = driverAry.filter(v=>v.is_active == isActive);
        console.log(isActive, filteredDrivers.length)
        drawTable(filteredDrivers);
    })

    $("#openPwdmodal").click(()=>{
        $('#pwd_change_btn').prop('disabled', false);
    })

    $("#pwd_change_btn").click(async ()=>{
        const oldPwd = $("#old_password").val();
        const newPwd = $("#new_password").val();
        const confirmPwd = $("#confirm_password").val();
        if(oldPwd==""){
            toastr.warning("Please enter your password."); return;
        } else if(newPwd == ""){
            toastr.warning("Please enter new password."); return;
        }
        if(newPwd !== confirmPwd) {
            toastr.warning("The New password confirmation doesn't match."); return;
        }
        localStorage.setItem('enc_key', encrypt(newPwd, "system-key"));
        pwd = newPwd;
        $('#pwd_change_btn').prop('disabled', true);
        $(".loadding").show();
        
        if(driverAry.length>0){
            for (let i = 0; i < driverAry.length; i++) {
                const driver = driverAry[i];
                const editData = {
                    ...driver,
                    adress: encrypt(decrypt(driver.adress, oldPwd), newPwd),
                    birthday: encrypt(decrypt(driver.birthday, oldPwd), newPwd),
                    cell_phone: encrypt(decrypt(driver.cell_phone, oldPwd), newPwd),
                    city: encrypt(decrypt(driver.city, oldPwd), newPwd),
                    driver_license: encrypt(decrypt(driver.driver_license, oldPwd), newPwd),
                    full_name: encrypt(decrypt(driver.full_name, oldPwd), newPwd),
                    hire_date: encrypt(decrypt(driver.hire_date, oldPwd), newPwd),
                    home_phone: encrypt(decrypt(driver.home_phone, oldPwd), newPwd),
                    ss: encrypt(decrypt(driver.ss, oldPwd), newPwd),
                    state_text: encrypt(decrypt(driver.state_text, oldPwd), newPwd),
                    state_zip: encrypt(decrypt(driver.state_zip, oldPwd), newPwd),
                }
                $.ajax({
                    url: "/api/v1/drivers",
                    type: "PATCH",
                    dataType: "json",
                    data: JSON.stringify(editData),
                    contentType: "application/json",
                    success: function (response) {
                    },
                    error: function (xhr, status, err) {
                        toastr.error(err, status);
                    }
                });
            }
            $(".loadding").hide();
            $("#pwdModal").modal('toggle');
            window.location.reload();
        }
    })
});