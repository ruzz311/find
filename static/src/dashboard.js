'use strict';
/**
 * DASHBOARD SCRIPTs
 */

function getGroup() {
    return window.__findData.group;
}

$(function(){
    var userInterval,
        userkey;

    function userLocPolling() {
        $.getJSON("/userlocs", {group: getGroup()}, function (data) {
            var i = 0,
                total = 0,
                tuples = [],
                vals = [];

            if (!!data['success']) {
                for (var key in data['users']) {
                    if (Object.prototype.hasOwnProperty(key)) {
                        continue;
                    }
                    userkey = key;
                    console.log(key);
                    console.log(data['users'][key]);
                    $('#lastSeen' + key).html("<strong>Last seen:</strong> " + data['users'][key]['time'] + " at " + data['users'][key]['location']);
                    // $('#bayes' + key).text("Bayes: " + JSON.stringify(data['users'][key]['bayes']));

                    for (var key2 in data['users'][key]['bayes']) {
                        tuples.push([key2, data['users'][key]['bayes'][key2]]);
                    }

                    tuples.sort(function (a, b) {
                        a = a[1];
                        b = b[1];
                        return a < b ? -1 : (a > b ? 1 : 0);
                    });
                    for (i = tuples.length - 1; i >= 0; i--) {
                        total += Math.exp(tuples[i][1]);
                    }
                    vals = [];
                    for (i = tuples.length - 1; i >= 0; i--) {
                        var keyName = tuples[i][0];
                        var value = Math.round(Math.exp(tuples[i][1]) / total * 100);
                        if (value > 10) {
                            vals.push(value + "% " + keyName);
                        }
                    }
                    console.log(vals.join());
                    $('#bayes' + userkey).html("<strong>Confidence:</strong> " + vals.join());


                }
            }
        });
    }

    $(document).ready(function () {
        $('.deleteloc').css('cursor', 'pointer');
        $('.deleteuser').css('cursor', 'pointer');
        $('.editloc').css('cursor', 'pointer');
        $('.edituser').css('cursor', 'pointer');

        //userInterval = setInterval(userLocPolling,1500);

    });

    $('.deleteloc').click(function () {
        var placeToDelete = $(this).attr('id');
        swal({
                title: "Delete location",
                text: "Are you sure you want to delete " + placeToDelete,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel pls!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var req = $.ajax({
                        method: "DELETE",
                        url: "/location" + '?' + $.param({"group": getGroup(), "location": placeToDelete})
                    });
                    req.done(function (data) {
                        console.log(data);
                        swal("Deleted!", data['message'], "success");
                        location.reload();
                    });
                    req.fail(function (data) {
                        swal("Sorry", data['message'], "error");
                    });
                } else {
                    swal("Cancelled", "Your data is safe :)", "error");
                }
            });

    });

    $('.deleteuser').click(function () {
        var userToDelete = $(this).attr('id');
        swal({
                title: "Delete user",
                text: "Are you sure you want to delete " + userToDelete,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel pls!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {
                    var req = $.ajax({
                        method: "DELETE",
                        url: "/user" + '?' + $.param({"group": getGroup(), "user": userToDelete})
                    });
                    req.done(function (data) {
                        console.log(data);
                        swal("Deleted!", data['message'], "success");
                        location.reload();
                    });
                    req.fail(function (data) {
                        swal("Sorry", data['message'], "error");
                    });
                } else {
                    swal("Cancelled", "Your data is safe :)", "error");
                }
            });

    });

    $('#startTracking').click(function () {
        userLocPolling();
        userInterval = setInterval(userLocPolling, 1500)
    });

    $('#recalculateAll').click(function () {
        var swalOpts = {
            title: "Recalculate priors and analyze accuracy",
            text: "This may take a minute",
            type: "info",
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        };

        swal(swalOpts, function () {
            $.get("/calculate", {"group": getGroup()}, function (data) {
                console.log(data);
                if (!data['success']) {
                    return;
                }
                swal("Recalculating priors successful!");
                location.reload();
            });
        });
    });

    $('.editloc').click(function () {
        var place = $(this).attr('id'),
            editLocationModal = {
                title: "Edit location",
                text: "Are you sure you want to rename '" + place + "'",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, rename it!",
                cancelButtonText: "No, cancel pls!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            editNameInput = {
                title: "Edit name",
                text: "Enter the new name for '" + place + "':",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                inputPlaceholder: "newlocation"
            };

        swal(editLocationModal, function (isConfirm) {
            if (isConfirm) {
                swal(editNameInput, executeEditName);
            } else {
                swal("Cancelled", "Name is still the same! :)", "error");
            }
        });

        function executeEditName(inputValue){
            if (inputValue === false || inputValue === "") {
                swal.showInputError("You need to write something!");
                return false
            }
            var editNameQuery = {
                "group": getGroup(),
                "location": place,
                "newname": inputValue
            };
            $.get("/editname", editNameQuery, editNameQueryHandle);
            swal("Nice!", "You wrote: " + inputValue, "success");
        }

        function editNameQueryHandle(data) {
            console.log(data);
            if (data['success']) {
                swal("Edited!", data['message'], "success");
                location.reload()
            } else {
                swal("Something went wrong.", data['message'], "error");
            }
        }

    });


    $('.edituser').click(function () {
        var place = $(this).attr('id');
        swal({
                title: "Edit user name",
                text: "Are you sure you want to rename '" + place + "'",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, rename it!",
                cancelButtonText: "No, cancel pls!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {


                    swal({
                            title: "Edit name",
                            text: "Enter the new name for '" + place + "':",
                            type: "input",
                            showCancelButton: true,
                            closeOnConfirm: false,
                            animation: "slide-from-top",
                            inputPlaceholder: "newlocation"
                        },
                        function (inputValue) {
                            if (inputValue === false) {
                                swal.showInputError("You need to write something!");
                                return false
                            }

                            if (inputValue === "") {
                                swal.showInputError("You need to write something!");
                                return false
                            }
                            console.log({
                                "group": getGroup(),
                                "user": place,
                                "newname": inputValue
                            })
                            $.get("/editusername", {
                                    "group": getGroup(),
                                    "user": place,
                                    "newname": inputValue
                                },
                                function (data) {
                                    console.log(data);
                                    if (data['success']) {
                                        swal("Edited!", data['message'], "success");
                                        location.reload()
                                    } else {
                                        swal("Something went wrong.", data['message'], "error");
                                    }
                                }
                            );


                            swal("Nice!", "You wrote: " + inputValue, "success");
                        });

                } else {
                    swal("Cancelled", "Name is still the same! :)", "error");
                }
            });

    });


    $('.editnetworkloc').click(function () {
        var place = $(this).attr('id');
        swal({
                title: "Edit location",
                text: "Are you sure you want to rename '" + place + "'",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, rename it!",
                cancelButtonText: "No, cancel pls!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {


                    swal({
                            title: "Edit name",
                            text: "Enter the new name for '" + place + "':",
                            type: "input",
                            showCancelButton: true,
                            closeOnConfirm: false,
                            animation: "slide-from-top",
                            inputPlaceholder: "newlocation"
                        },
                        function (inputValue) {
                            if (inputValue === false) {
                                swal.showInputError("You need to write something!");
                                return false
                            }

                            if (inputValue === "") {
                                swal.showInputError("You need to write something!");
                                return false
                            }
                            console.log({
                                "group": getGroup(),
                                "oldname": place,
                                "newname": inputValue
                            })
                            $.get("/editnetworkname", {
                                    "group": getGroup(),
                                    "oldname": place,
                                    "newname": inputValue
                                },
                                function (data) {
                                    console.log(data);
                                    if (data['success']) {
                                        swal("Edited!", data['message'], "success");
                                        location.reload()
                                    } else {
                                        swal("Something went wrong.", data['message'], "error");
                                    }
                                }
                            );


                            swal("Please wait while name is changed", "You wrote: " + inputValue, "success");
                        });

                } else {
                    swal("Cancelled", "Name is still the same! :)", "error");
                }
            });
    });
});