document.addEventListener('DOMContentLoaded', function() {
    const placesToVisitContainer = document.getElementById('placesToVisitContainer');
    const addPlaceBtn = placesToVisitContainer.querySelector('.add-place-btn');

    let placeCounter = 1;

    addPlaceBtn.addEventListener('click', function() {
        const newPlaceInputGroup = document.createElement('div');
        newPlaceInputGroup.classList.add('input-group', 'mb-2');

        newPlaceInputGroup.innerHTML = `
            <input type="text" class="form-control places-to-visit-input" name="placesToVisit[]" placeholder="e.g., Qutub Minar" required>
            <button class="btn btn-outline-danger remove-place-btn" type="button"><i class="fas fa-minus"></i> Remove</button>
        `;

        placesToVisitContainer.insertBefore(newPlaceInputGroup, addPlaceBtn.closest('.input-group'));

        newPlaceInputGroup.querySelector('.remove-place-btn').addEventListener('click', function() {
            if (placesToVisitContainer.querySelectorAll('.places-to-visit-input').length > 1) {
                newPlaceInputGroup.remove();
                validateDynamicPlaces();
            } else {
                alert("You must have at least one 'Place to Visit'.");
            }
        });

        placesToVisitContainer.querySelector('.invalid-feedback').style.display = 'none';
        placesToVisitContainer.querySelector('.places-to-visit-input').classList.remove('is-invalid');
        document.getElementById('placesToVisitError').style.display = 'none';

        placeCounter++;
    });

    const bookingForm = document.getElementById('bookingForm');
    const travellerNameInput = document.getElementById('travellerName');
    const dateOfTravelInput = document.getElementById('dateOfTravel');
    const pickupLocationInput = document.getElementById('pickupLocation');
    const destinationInput = document.getElementById('destination');
    const numberOfPersonsInput = document.getElementById('numberOfPersons');
    const termsAndConditionsCheckbox = document.getElementById('termsAndConditions');
    const placesToVisitError = document.getElementById('placesToVisitError');

    const nameRegex = /^[a-zA-Z\s.-]+$/;
    const locationRegex = /^[a-zA-Z0-9\s.,#'"-]+$/;

    function validateField(inputElement, regex = null) {
        let isValid = true;
        const feedbackElement = inputElement.nextElementSibling;

        if (inputElement.hasAttribute('required') && inputElement.value.trim() === '') {
            isValid = false;
        } else if (inputElement.type === 'number' && inputElement.min && parseInt(inputElement.value) < parseInt(inputElement.min)) {
            isValid = false;
        } else if (regex && !regex.test(inputElement.value.trim())) {
            isValid = false;
        } else if (inputElement.type === 'date') {
            const selectedDate = new Date(inputElement.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                isValid = false;
                feedbackElement.textContent = 'Date of travel cannot be in the past.';
            }
        } else if (inputElement.type === 'checkbox') {
            if (!inputElement.checked) {
                isValid = false;
            }
        }

        if (!isValid) {
            inputElement.classList.add('is-invalid');
            if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
                feedbackElement.style.display = 'block';
            }
        } else {
            inputElement.classList.remove('is-invalid');
            if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
                feedbackElement.style.display = 'none';
            }
        }
        return isValid;
    }

    function validateDynamicPlaces() {
        let allDynamicPlacesValid = true;
        const placeInputs = placesToVisitContainer.querySelectorAll('.places-to-visit-input');
        placeInputs.forEach(input => {
            if (input.value.trim() === '') {
                input.classList.add('is-invalid');
                allDynamicPlacesValid = false;
            } else if (!locationRegex.test(input.value.trim())) {
                input.classList.add('is-invalid');
                allDynamicPlacesValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });

        if (!allDynamicPlacesValid) {
            placesToVisitError.style.display = 'block';
        } else {
            placesToVisitError.style.display = 'none';
        }
        return allDynamicPlacesValid;
    }

    travellerNameInput.addEventListener('input', () => validateField(travellerNameInput, nameRegex));
    dateOfTravelInput.addEventListener('change', () => validateField(dateOfTravelInput));
    pickupLocationInput.addEventListener('input', () => validateField(pickupLocationInput, locationRegex));
    destinationInput.addEventListener('input', () => validateField(destinationInput, locationRegex));
    numberOfPersonsInput.addEventListener('input', () => validateField(numberOfPersonsInput));
    termsAndConditionsCheckbox.addEventListener('change', () => validateField(termsAndConditionsCheckbox));

    placesToVisitContainer.querySelector('.places-to-visit-input').addEventListener('input', validateDynamicPlaces);


    bookingForm.addEventListener('submit', function(event) {
        event.preventDefault();

        let formIsValid = true;

        formIsValid = validateField(travellerNameInput, nameRegex) && formIsValid;
        formIsValid = validateField(dateOfTravelInput) && formIsValid;
        formIsValid = validateField(pickupLocationInput, locationRegex) && formIsValid;
        formIsValid = validateField(destinationInput, locationRegex) && formIsValid;
        formIsValid = validateField(numberOfPersonsInput) && formIsValid;
        formIsValid = validateField(termsAndConditionsCheckbox) && formIsValid;

        formIsValid = validateDynamicPlaces() && formIsValid;

        if (formIsValid) {
            const formData = {
                travellerName: travellerNameInput.value.trim(),
                dateOfTravel: dateOfTravelInput.value,
                pickupLocation: pickupLocationInput.value.trim(),
                destination: destinationInput.value.trim(),
                numberOfPersons: parseInt(numberOfPersonsInput.value),
                termsAccepted: termsAndConditionsCheckbox.checked,
            };

            const placesToVisitInputs = placesToVisitContainer.querySelectorAll('.places-to-visit-input');
            const placesToVisit = [...placesToVisitInputs].map(input => input.value.trim()).filter(place => place !== '');

            formData.placesToVisit = placesToVisit;

            console.log('Form Data:', formData);

            sessionStorage.setItem('bookingDetails', JSON.stringify(formData));

            window.location.href = 'success.html';

        } else {
            console.log('Form has validation errors.');
            const firstInvalid = document.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    const agreeTermsButton = document.getElementById('agreeTermsButton');
    if (agreeTermsButton) {
        agreeTermsButton.addEventListener('click', function() {
            termsAndConditionsCheckbox.checked = true;
            validateField(termsAndConditionsCheckbox);
        });
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    dateOfTravelInput.min = `${yyyy}-${mm}-${dd}`;
});