/* =========================================================
   VERIFIED LEADS
   MAIN WEBSITE APPLICATION
   =========================================================

   Handles:
   1. Navigation
   2. Pricing and package selection
   3. Order modal
   4. International phone numbers
   5. Form validation
   6. Order summary
   7. Supabase Edge Function
   8. Paymegate checkout redirect

   IMPORTANT:
   Payment creation happens on the backend.
   Never put Paymegate API keys in this file.
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const VERIFIED_LEADS_CONFIG = {

    SUPABASE_URL: "https://usvrpqmipsthuxomekcb.supabase.co",

    SUPABASE_ANON_KEY: "sb_publishable_yi8-rh0Oh2YwjpH2amLsyg_D3l2B34o",

    PAYMENT_FUNCTION: "create-payment",

    CONSENT_VERSION: "2026-01"

};


/* =========================================================
   2. PACKAGE CONFIGURATION
   ========================================================= */

const PACKAGES = {

    Trial: {
        name: "Trial",
        amount: 29,
        leads: 25,
        delivery: "48 hours"
    },

    Standard: {
        name: "Standard",
        amount: 49,
        leads: 50,
        delivery: "48 hours"
    },

    Professional: {
        name: "Professional",
        amount: 99,
        leads: 100,
        delivery: "72 hours"
    },

    Enterprise: {
        name: "Enterprise",
        amount: 399,
        leads: 500,
        delivery: "72 hours"
    }

};


/* =========================================================
   3. DOM ELEMENTS
   ========================================================= */

const DOM = {

    menuButton: document.getElementById("menuButton"),

    navLinks: document.getElementById("navLinks"),

    modal: document.getElementById("orderModal"),

    closeModal: document.getElementById("closeModal"),

    orderForm: document.getElementById("orderForm"),

    category: document.getElementById("businessCategory"),

    otherCategoryGroup:
        document.getElementById("otherCategoryGroup"),

    otherCategory:
        document.getElementById("otherCategory"),

    businessName:
        document.getElementById("businessName"),

    contactName:
        document.getElementById("contactName"),

    phone:
        document.getElementById("phoneNumber"),

    email:
        document.getElementById("businessEmail"),

    businessLink:
        document.getElementById("businessLink"),

    description:
        document.getElementById("productDescription"),

    consent:
        document.getElementById("consent"),

    selectedPackage:
        document.getElementById("selectedPackage"),

    selectedAmount:
        document.getElementById("selectedAmount"),

    selectedLeads:
        document.getElementById("selectedLeads"),

    summaryPackage:
        document.getElementById("summaryPackage"),

    summaryLeads:
        document.getElementById("summaryLeads"),

    summaryDelivery:
        document.getElementById("summaryDelivery"),

    summaryAmount:
        document.getElementById("summaryAmount"),

    submitButton:
        document.getElementById("submitOrder"),

    formMessage:
        document.getElementById("formMessage"),

    currentYear:
        document.getElementById("currentYear")

};


/* =========================================================
   4. APPLICATION STATE
   ========================================================= */

let selectedPackage = null;

let telephoneInput = null;

let isSubmitting = false;


/* =========================================================
   5. SUPABASE INITIALIZATION
   ========================================================= */

let supabaseClient = null;


function initializeSupabase() {

    if (
        !VERIFIED_LEADS_CONFIG.SUPABASE_URL ||
        !VERIFIED_LEADS_CONFIG.SUPABASE_ANON_KEY ||
        VERIFIED_LEADS_CONFIG.SUPABASE_URL.includes("YOUR_") ||
        VERIFIED_LEADS_CONFIG.SUPABASE_ANON_KEY.includes("YOUR_")
    ) {

        console.warn(
            "Verified Leads: Supabase configuration is missing."
        );

        return false;

    }

    if (!window.supabase || !window.supabase.createClient) {

        console.error(
            "Supabase JavaScript library was not loaded."
        );

        return false;

    }

    try {

        supabaseClient = window.supabase.createClient(

            VERIFIED_LEADS_CONFIG.SUPABASE_URL,

            VERIFIED_LEADS_CONFIG.SUPABASE_ANON_KEY,

            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            }

        );

        return true;

    } catch (error) {

        console.error(
            "Supabase initialization failed:",
            error
        );

        return false;

    }

}


/* =========================================================
   6. GENERAL UTILITIES
   ========================================================= */

function formatUSD(amount) {

    return new Intl.NumberFormat("en-US", {

        style: "currency",

        currency: "USD",

        minimumFractionDigits: 0,

        maximumFractionDigits: 2

    }).format(amount);

}


function showMessage(message, type = "error") {

    DOM.formMessage.textContent = message;

    DOM.formMessage.className =
        "form-message " + type;

    DOM.formMessage.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

    });

}


function clearMessage() {

    DOM.formMessage.textContent = "";

    DOM.formMessage.className = "form-message";

}


function setButtonLoading(loading) {

    DOM.submitButton.disabled = loading;

    DOM.submitButton.textContent = loading

        ? "Preparing Your Checkout..."

        : "Continue to Secure Checkout";

}


/* =========================================================
   7. MOBILE NAVIGATION
   ========================================================= */

function initializeNavigation() {

    if (!DOM.menuButton || !DOM.navLinks) {
        return;
    }

    DOM.menuButton.addEventListener("click", () => {

        const isOpen =
            DOM.navLinks.classList.toggle("active");

        DOM.menuButton.textContent =
            isOpen ? "×" : "☰";

        DOM.menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });


    DOM.navLinks.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            DOM.navLinks.classList.remove("active");

            DOM.menuButton.textContent = "☰";

            DOM.menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}


/* =========================================================
   8. CURRENT YEAR
   ========================================================= */

function initializeYear() {

    if (DOM.currentYear) {

        DOM.currentYear.textContent =
            new Date().getFullYear();

    }

}


/* =========================================================
   9. FAQ ACCORDION
   ========================================================= */

function initializeFAQ() {

    const questions =
        document.querySelectorAll(".faq-question");

    questions.forEach(question => {

        question.addEventListener("click", () => {

            const currentItem =
                question.closest(".faq-item");

            if (!currentItem) return;

            const wasOpen =
                currentItem.classList.contains("open");

            document.querySelectorAll(".faq-item").forEach(item => {

                item.classList.remove("open");

            });

            if (!wasOpen) {

                currentItem.classList.add("open");

            }

        });

    });

}


/* =========================================================
   10. INITIALIZE INTERNATIONAL PHONE INPUT
   ========================================================= */

function initializePhoneInput() {

    if (!DOM.phone) return;

    if (!window.intlTelInput) {

        console.error(
            "International telephone library was not loaded."
        );

        return;

    }

    telephoneInput = window.intlTelInput(

        DOM.phone,

        {

            initialCountry: "ng",

            separateDialCode: true,

            nationalMode: true,

            autoPlaceholder: "polite",

            formatOnDisplay: true,

            countrySearch: true,

            loadUtils: () =>

                import(
                    "https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.js"
                )

        }

    );

}


/* =========================================================
   11. OPEN ORDER MODAL
   ========================================================= */

function openOrderModal(packageName) {

    const packageData = PACKAGES[packageName];

    if (!packageData) {

        console.error("Invalid package:", packageName);

        return;

    }

    selectedPackage = packageData;

    DOM.selectedPackage.value =
        packageData.name;

    DOM.selectedAmount.value =
        packageData.amount;

    DOM.selectedLeads.value =
        packageData.leads;


    DOM.summaryPackage.textContent =
        packageData.name;

    DOM.summaryLeads.textContent =
        packageData.leads + " leads";

    DOM.summaryDelivery.textContent =
        packageData.delivery;

    DOM.summaryAmount.textContent =
        formatUSD(packageData.amount);


    clearMessage();

    DOM.modal.classList.add("active");

    DOM.modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";


    setTimeout(() => {

        DOM.category.focus();

    }, 150);

}


/* =========================================================
   12. CLOSE ORDER MODAL
   ========================================================= */

function closeOrderModal() {

    if (isSubmitting) return;

    DOM.modal.classList.remove("active");

    DOM.modal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";


    clearMessage();

}


/* =========================================================
   13. PACKAGE BUTTONS
   ========================================================= */

function initializePackageButtons() {

    const buttons =
        document.querySelectorAll(".order-button");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const packageName =
                button.dataset.package;

            openOrderModal(packageName);

        });

    });

}


/* =========================================================
   14. MODAL EVENTS
   ========================================================= */

function initializeModal() {

    if (DOM.closeModal) {

        DOM.closeModal.addEventListener(
            "click",
            closeOrderModal
        );

    }


    if (DOM.modal) {

        DOM.modal.addEventListener("click", event => {

            if (event.target === DOM.modal) {

                closeOrderModal();

            }

        });

    }


    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            DOM.modal &&
            DOM.modal.classList.contains("active")
        ) {

            closeOrderModal();

        }

    });

}


/* =========================================================
   15. CONDITIONAL OTHER CATEGORY
   ========================================================= */

function initializeOtherCategory() {

    if (!DOM.category || !DOM.otherCategoryGroup || !DOM.otherCategory) {
        return;
    }

    DOM.category.addEventListener("change", () => {

        const isOther =
            DOM.category.value === "Other";


        DOM.otherCategoryGroup.classList.toggle(
            "visible",
            isOther
        );


        DOM.otherCategory.required = isOther;


        if (!isOther) {

            DOM.otherCategory.value = "";

        }

    });

}


/* =========================================================
   16. EMAIL VALIDATION
   ========================================================= */

function validateEmail(email) {

    if (!email) return true;

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    return pattern.test(email);

}
/* =========================================================
   17. BUSINESS LINK VALIDATION
   ========================================================= */

function validateBusinessLink(value) {

    if (!value) return true;

    try {

        const url = new URL(value);

        return (
            url.protocol === "https:" ||
            url.protocol === "http:"
        );

    } catch {

        return false;

    }

}


/* =========================================================
   18. PHONE VALIDATION
   ========================================================= */

function validatePhone() {

    if (!telephoneInput) {

        return {
            valid: false,
            number: ""
        };

    }

    const number =
        telephoneInput.getNumber();

    const valid =
        telephoneInput.isValidNumber();

    return {

        valid,

        number

    };

}


/* =========================================================
   19. VALIDATE ORDER FORM
   ========================================================= */

function validateOrderForm() {

    clearMessage();


    if (!selectedPackage) {

        showMessage(
            "Please select a package before continuing."
        );

        return false;

    }


    if (!DOM.category.value) {

        showMessage(
            "Please select your business category."
        );

        DOM.category.focus();

        return false;

    }


    if (
        DOM.category.value === "Other" &&
        !DOM.otherCategory.value.trim()
    ) {

        showMessage(
            "Please specify your business category."
        );

        DOM.otherCategory.focus();

        return false;

    }


    if (!DOM.businessName.value.trim()) {

        showMessage(
            "Please enter your business name."
        );

        DOM.businessName.focus();

        return false;

    }


    if (!DOM.contactName.value.trim()) {

        showMessage(
            "Please enter the contact person's full name."
        );

        DOM.contactName.focus();

        return false;

    }


    const phoneResult = validatePhone();

    if (!phoneResult.valid) {

        showMessage(
            "Please enter a valid phone number and select the correct country code."
        );

        DOM.phone.focus();

        return false;

    }


    if (!validateEmail(DOM.email.value.trim())) {

        showMessage(
            "Please enter a valid business email address."
        );

        DOM.email.focus();

        return false;

    }


    if (
        !validateBusinessLink(
            DOM.businessLink.value.trim()
        )
    ) {

        showMessage(
            "Please enter a valid business link beginning with https:// or http://."
        );

        DOM.businessLink.focus();

        return false;

    }


    if (!DOM.description.value.trim()) {

        showMessage(
            "Please describe your product or service and include its price."
        );

        DOM.description.focus();

        return false;

    }


    if (!DOM.consent.checked) {

        showMessage(
            "Please review and accept the terms before continuing."
        );

        DOM.consent.focus();

        return false;

    }


    return true;

}


/* =========================================================
   20. BUILD ORDER PAYLOAD
   ========================================================= */

function buildOrderPayload() {

    const phoneResult = validatePhone();


    let category = DOM.category.value;


    if (category === "Other") {

        category =
            "Other: " +
            DOM.otherCategory.value.trim();

    }


    return {

        package_name:
            selectedPackage.name,

        amount:
            selectedPackage.amount,

        currency:
            "USD",

        lead_quantity:
            selectedPackage.leads,

        delivery_timeline:
            selectedPackage.delivery,

        business_category:
            category,

        business_name:
            DOM.businessName.value.trim(),

        contact_name:
            DOM.contactName.value.trim(),

        whatsapp_number:
            phoneResult.number,

        business_email:
            DOM.email.value.trim() || null,

        business_link:
            DOM.businessLink.value.trim() || null,

        product_description:
            DOM.description.value.trim(),

        consent_given:
            true,

        consent_version:
            VERIFIED_LEADS_CONFIG.CONSENT_VERSION

    };

}


/* =========================================================
   21. EXTRACT FUNCTION ERROR
   ========================================================= */

async function getFunctionError(error) {

    if (error && error.context) {

        try {

            const response =
                await error.context.json();

            if (response && response.error) {

                return response.error;

            }

            if (response && response.message) {

                return response.message;

            }

        } catch {

            // Use the standard fallback below.

        }

    }

    return error?.message ||
        "Something went wrong. Please try again.";

}


/* =========================================================
   22. CREATE PAYMENT SESSION
   ========================================================= */

async function createPaymentSession(payload) {

    if (!supabaseClient) {

        throw new Error(
            "The website payment service has not been configured yet."
        );

    }


    const { data, error } =
        await supabaseClient.functions.invoke(

            VERIFIED_LEADS_CONFIG.PAYMENT_FUNCTION,

            {

                body: {

                    action: "create_payment",

                    payload

                }

            }

        );


    if (error) {

        const message =
            await getFunctionError(error);

        throw new Error(message);

    }


    if (!data) {

        throw new Error(
            "The payment server returned an empty response."
        );

    }


    /*
       Expected backend response:

       {
           "checkout_url": "https://www.paymegate.com/pay/..."
       }

       OR

       {
           "payment": {
               "checkout_url": "https://www.paymegate.com/pay/..."
           }
       }
    */


    const checkoutURL =

        data.checkout_url ||

        data.payment?.checkout_url;


    if (!checkoutURL) {

        throw new Error(
            "A checkout link was not returned. Please contact support."
        );

    }


    let parsedURL;

    try {

        parsedURL = new URL(checkoutURL);

    } catch {

        throw new Error(
            "The payment server returned an invalid checkout link."
        );

    }


    /*
       Only allow official Paymegate checkout hosts.
    */

    const trustedHosts = [

        "paymegate.com",

        "www.paymegate.com"

    ];


    if (

        parsedURL.protocol !== "https:" ||

        !trustedHosts.includes(parsedURL.hostname)

    ) {

        throw new Error(
            "The payment server returned an untrusted checkout address."
        );

    }


    return checkoutURL;

}


/* =========================================================
   23. HANDLE ORDER SUBMISSION
   ========================================================= */

async function handleOrderSubmission(event) {

    event.preventDefault();


    if (isSubmitting) {

        return;

    }


    if (!validateOrderForm()) {

        return;

    }


    isSubmitting = true;

    setButtonLoading(true);

    clearMessage();


    try {

        const payload = buildOrderPayload();


        const checkoutURL =
            await createPaymentSession(payload);


        /*
           Redirect the customer to Paymegate's
           official hosted checkout page.

           Payment verification must happen
           through the backend webhook.
        */

        window.location.assign(checkoutURL);


    } catch (error) {

        console.error(
            "Verified Leads payment creation failed:",
            error
        );


        showMessage(

            error?.message ||

            "Unable to prepare your payment. Please try again.",

            "error"

        );


        isSubmitting = false;

        setButtonLoading(false);

    }

}


/* =========================================================
   24. FORM INITIALIZATION
   ========================================================= */

function initializeOrderForm() {

    if (!DOM.orderForm) {

        console.error(
            "Verified Leads order form was not found."
        );

        return;

    }


    DOM.orderForm.addEventListener(

        "submit",

        handleOrderSubmission

    );


    DOM.orderForm.addEventListener(
        "input",
        clearMessage
    );


    DOM.orderForm.addEventListener(
        "change",
        clearMessage
    );

}


/* =========================================================
   25. INITIALIZE APPLICATION
   ========================================================= */

function initializeVerifiedLeads() {

    console.log(
        "Verified Leads website initialized."
    );


    initializeSupabase();

    initializeNavigation();

    initializeYear();

    initializeFAQ();

    initializePhoneInput();

    initializePackageButtons();

    initializeModal();

    initializeOtherCategory();

    initializeOrderForm();


}


/* =========================================================
   26. START APPLICATION
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeVerifiedLeads
    );

} else {

    initializeVerifiedLeads();

}


/* =========================================================
   END OF VERIFIED LEADS APP.JS
   ========================================================= */