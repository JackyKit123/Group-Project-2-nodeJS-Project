$(() => {
    if($('#error_message').html() == 'Registered') window.location = "/registered"

    const $email = $("input[name='username']");
    const $password = $("input[name='password']");
    const $confirm_password = $("input[name='confirm_password']");
    const $submit = $("input[type='submit']");

    //prevent user input interrupting script, remove disabled on load
    $email.removeAttr("disabled");
    $password.removeAttr("disabled");

    //validate email input
    $($email.focusout(() => {
        if (!validateEmail($email.val())) {
            $submit.attr("disabled", "disabled");
            $email.css("border", "red solid 1px");
        } else {
            $email.css("border", "1px solid grey");
        }
    }));

    //valid password and show a password structure reminder
    $($password.focus(() => {
        $("#password_structure_reminder").show();
    }));

    $($password.keyup(() => {
        validatePassword($password.val());
    }));

    $($password.change(() => {
        if (validatePassword($password.val())) {
            $("#password_structure_reminder").fadeOut(500);
            $confirm_password.removeAttr("disabled");
        } else {
            $confirm_password.attr("disabled", "disabled");
            $submit.attr("disabled", "disabled");
        }
    }));

    //validate the confirmed password
    $($confirm_password.change(() => {
        if ($password.val() !== $confirm_password.val()) {
            $submit.attr("disabled", "disabled");
            $confirm_password.css("border", "red solid 1px");
        } else {
            $confirm_password.css("border", "1px solid grey");
        }
    }));

    //only allow user to press submit once all identities are validated
    $(document).keyup(() => {
        if (validateEmail($email.val()) && validatePassword($password.val()) && $password.val() == $confirm_password.val())
        $submit.removeAttr("disabled");
    })

    const validateEmail = email => {
        const validator = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return validator.test(email);
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