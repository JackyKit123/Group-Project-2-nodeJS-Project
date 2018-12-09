$(() => {
    if ($('#error_message').html() == 'Registered') window.location = "/registered"

    const $username = $("input[name='username']");
    const $email = $("input[name='email']");
    const $password = $("input[name='password']");
    const $confirm_password = $("input[name='confirm_password']");
    const $submit = $("input[type='submit']");


    //prevent user input interrupting script, remove disabled on load
    $email.removeAttr("disabled");
    $password.removeAttr("disabled");
    $username.removeAttr("disabled");
    $confirm_password.removeAttr("disabled")

    //validate email input
    $($username.focusout(() => {
        if (!validateUsername($username.val())) {
            $username.css("border", "red solid 1px");
            $('#invalid_username_reminder').show();
        } else {
            $username.css("border", "1px solid grey");
            $('#invalid_username_reminder').hide();
        }
    }));

    //validate email input
    $($email.focusout(() => {
        if (!validateEmail($email.val())) {
            $email.css("border", "red solid 1px");
            $('#invalid_email_reminder').show();
        } else {
            $email.css("border", "1px solid grey");
            $('#invalid_email_reminder').hide();
        }
    }));

    //valid password and show a password structure reminder
    $($password.focus(() => {
        $("#password_structure_reminder").show();
    }));

    $($password.keyup(() => {
        validatePassword($password.val());
    }));

    $($password.focusout(() => {
        if (validatePassword($password.val()))
            $("#password_structure_reminder").hide();
    }));

    //validate the confirmed password
    $($confirm_password.change(() => {
        if ($password.val() !== $confirm_password.val()) {
            $confirm_password.css("border", "red solid 1px");
            $('#unmatched_password_reminder').show();
        } else {
            $confirm_password.css("border", "1px solid grey");
            $('#unmatched_password_reminder').hide();
        }
    }));

    //only allow user to press submit once all identities are validated
    $(document).keyup(() => {
        if (validateUsername($username.val()) && validateEmail($email.val()) && validatePassword($password.val()) && $password.val() == $confirm_password.val())
            $submit.removeAttr("disabled");
        else
            $submit.attr("disabled", "disabled");
    })

    const validateEmail = email => {
        const validator = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return validator.test(email);
    }

    const validateUsername = username => {
        const validator = /^[0-9a-zA-Z_.-]+$/i;
        return validator.test(username);
    }

    const validatePassword = password => {
        const $length = $("#password_structure_reminder #length");
        const $letter = $("#password_structure_reminder #letter");
        const $number = $("#password_structure_reminder #number");
        const checkLength = (password.length < 8 || password.length > 16);
        const checkLetter = (! /[a-z]|[A-z]/.test(password));
        const checkNumber = (! /[0-9]/.test(password));
        if (checkLength) {
            $length.css("color", "red");
            $length.html("8 to 16 characters long ✘");
        } else {
            $length.css("color", "green");
            $length.html("8 to 16 characters long ✓")
        }
        if (checkLetter) {
            $letter.css("color", "red");
            $letter.html("Has any letters ✘");
        } else {
            $letter.css("color", "green");
            $letter.html("Has any letters ✓");
        }
        if (checkNumber) {
            $number.css("color", "red");
            $number.html("Has any numbers ✘");
        } else {
            $number.css("color", "green");
            $number.html("Has any numbers ✓");
        }
        if (checkLength || checkLetter || checkNumber) {
            $("#password_structure_reminder span").css("color", "red")
            return false;
        } else {
            $("#password_structure_reminder span").css("color", "green")
            return true;
        }
    }
});