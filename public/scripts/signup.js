$(() => {
    const $username = $("input[name='username']");
    const $displayname = $("input[name='display_name']");
    const $email = $("input[name='email']");
    const $password = $("input[name='password']");
    const $confirm_password = $("input[name='confirm_password']");
    const $submit = $("input[type='submit']");


    //prevent user input interrupting script, remove disabled on load
    $('input').removeAttr("disabled");
    $submit.attr('disabled', 'disabled');

    //validate username input
    $($username.focus(() => {
        $('#username_reminder').show();
        if (!validateUsername($username.val())) {
            $username.css("border", "2px red solid");
            $('#username_reminder').css('color', 'red');
        } else {
            $username.css("border", "2px solid green");
            $('#username_reminder').css('color', 'green');
        }
    }))

    $($username.keyup(() => {
        if (!validateUsername($username.val())) {
            $username.css("border", "2px red solid");
            $('#username_reminder').css('color', 'red');
        } else {
            $username.css("border", "2px solid green");
            $('#username_reminder').css('color', 'green');
        }
    }))

    $($username.focusout(() => {
        if (validateUsername($username.val())) {
            $('#username_reminder').hide();
        }
    }));

    //validate display name
    $($displayname.focus(() => {
        $('#displayedname_reminder').show();
        if (!validateDisplayName($displayname.val())) {
            $displayname.css("border", "2px red solid");
            $('#displayedname_reminder').css('color', 'red');
        } else {
            $displayname.css("border", "2px solid green");
            $('#displayedname_reminder').css('color', 'green');
        }
    }))

    $($displayname.keyup(() => {
        if (!validateDisplayName($displayname.val())) {
            $displayname.css("border", "2px red solid");
            $('#displayedname_reminder').css('color', 'red');
        } else {
            $displayname.css("border", "2px solid green");
            $('#displayedname_reminder').css('color', 'green');
        }
    }))

    $($displayname.focusout(() => {
        if (validateDisplayName($displayname.val())) {
            $('#displayedname_reminder').hide();
        }
    }));

    //validate email input
    $($email.focusout(() => {
        if (!validateEmail($email.val())) {
            $email.css("border", "2px red solid");
            $('#email_reminder').show();
        } else {
            $email.css("border", "2px solid green");
            $('#email_reminder').hide();
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
        if (validatePassword($password.val())) {
            $("#password_structure_reminder").hide();
        if ($password.val() == $confirm_password.val()) {
            $confirm_password.css("border", "2px solid green");
            $('#unmatched_password_reminder').hide();
        }
    }
    }));

    //validate the confirmed password
    $($confirm_password.focusout(() => {
        if ($password.val() !== $confirm_password.val() || !validatePassword($password.val())) {
            $confirm_password.css("border", "2px red solid");
            $('#unmatched_password_reminder').show();
        } else {
            $confirm_password.css("border", "2px solid green");
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
        const validator = /(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return validator.test(email);
    }


    const validateUsername = username => {
        return (username.length >= 5 && username.length <= 15 && !/\W/.test(username))
    }

    const validateDisplayName = name => {
        return (name.length >= 5 && name.length <= 15)
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
            $password.css("border", "2px solid red");
            return false;
        } else {
            $("#password_structure_reminder span").css("color", "green")
            $password.css("border", "2px solid green");
            return true;
        }
    }
});