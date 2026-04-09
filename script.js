document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('enrollmentForm');
    const enrollmentDateInput = document.getElementById('enrollment_date');
    const schoolNameSelect = document.getElementById('school_name');
    const priorSchoolNameSelect = document.getElementById('prior_school_name');

    // School Name Synchronization
    schoolNameSelect.addEventListener('change', () => {
        priorSchoolNameSelect.value = schoolNameSelect.value;
    });
    // Toggle "Other" Language logic
    window.toggleOtherLanguage = (selectElement, otherInputId) => {
        const otherInput = document.getElementById(otherInputId);
        if (selectElement.value === 'Other') {
            otherInput.style.display = 'block';
            otherInput.required = true;
        } else {
            otherInput.style.display = 'none';
            otherInput.required = false;
        }
    };

    // Webhook Configuration - CHANGE THIS LINE FOR PRODUCTION
    const WEBHOOK_URL = 'https://n8n.srv1498466.hstgr.cloud/webhook/f2e3f88d-e79d-4bd4-8dba-33966dde2bde'; 

    // Admission Status Logic
    const admissionRadios = document.querySelectorAll('input[name="admission_status"]');
    const enrolledFields = document.getElementById('enrolledFields');
    const demoFields = document.getElementById('demoFields');
    const enquiryFields = document.getElementById('enquiryFields');
    const enquiryDateInput = document.getElementById('enquiry_date');

    function toggleAdmissionStatus() {
        const selectedStatus = document.querySelector('input[name="admission_status"]:checked').value;
        
        // Hide all first
        enrolledFields.style.display = 'none';
        demoFields.style.display = 'none';
        enquiryFields.style.display = 'none';

        // Helper to toggle required attribute
        const setRequired = (container, isRequired) => {
            container.querySelectorAll('input, select, textarea').forEach(el => {
                // Enrollment Date and Potential Enrollment Date are OPTIONAL now
                if (el.id === 'enrollment_date' || el.id === 'potential_enrollment_date') {
                    el.removeAttribute('required');
                    return;
                }

                if (isRequired) {
                    el.setAttribute('required', '');
                } else {
                    el.removeAttribute('required');
                }
            });
        };

        // Reset all required
        setRequired(enrolledFields, false);
        setRequired(demoFields, false);
        setRequired(enquiryFields, false);

        if (selectedStatus === 'Enrolled') {
            enrolledFields.style.display = 'block';
            setRequired(enrolledFields, true);
        } else if (selectedStatus === 'Demo') {
            demoFields.style.display = 'block';
            setRequired(demoFields, true);
        } else if (selectedStatus === 'Enquiry') {
            enquiryFields.style.display = 'block';
            enquiryDateInput.setAttribute('required', '');
            // Auto-set today's date
            const today = new Date().toISOString().split('T')[0];
            enquiryDateInput.value = today;
        }
    }

    admissionRadios.forEach(r => r.addEventListener('change', toggleAdmissionStatus));
    toggleAdmissionStatus(); // Initial run

    // Version Check
    console.log('Enrollment Script V3.0 - Admission Status & Optional Dates');

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form Submit Triggered');
        
        try {
            const formData = new FormData(form);
            const data = {};

            // Helper to get radio/check value
            const getVal = (name) => formData.get(name);
            const getRadio = (name) => {
                const el = form.querySelector(`input[name="${name}"]:checked`);
                return el ? el.value : null;
            };

            // Formatting Date helper
            const formatDate = (val, isOptional = false) => {
                if (!val) return isOptional ? 'UNKNOWN' : '';
                const [y, m, d] = val.split('-');
                return `${d}-${m}-${y}`;
            };

            // Basic Info
            const first_name = getVal('first_name');
            const last_name = getVal('last_name');
            const gender = getRadio('gender');
            const dob = formatDate(getVal('dob'));
            const grade = getRadio('grade');
            const branch = getRadio('branch');
            const school_name = getVal('school_name');
            const prior_school_name = getVal('prior_school_name');
            const address = getVal('address');

            // Hobbies logic
            const hobbies_val = getVal('hobbies');
            const hobbies = hobbies_val === 'Other' ? getVal('hobbies_other') : hobbies_val;
            
            // Subjects
            const selectedSubjects = Array.from(form.querySelectorAll('input[name="subjects"]:checked'))
                .map(cb => cb.value);
            
            if (selectedSubjects.length < 5) {
                alert('Rule: Minimum 5 subjects must be selected.');
                const grid = document.querySelector('.checkbox-grid');
                if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // Primary Contact
            const primary_name = getVal('primary_name');
            const primary_number = getVal('primary_number');
            const primary_relation = getRadio('primary_relation');
            const primary_language = getVal('primary_language') === 'Other' ? getVal('primary_language_other') : getVal('primary_language');

            // Secondary Contact
            const secondary_name = getVal('secondary_name');
            const secondary_number = getVal('secondary_number');
            const secondary_relation = getRadio('secondary_relation');
            const secondary_language = getVal('secondary_language') === 'Other' ? getVal('secondary_language_other') : getVal('secondary_language');

            // Admission & Enrollment Logic
            const admission_status = getRadio('admission_status');
            let enrollment_status = '';
            let enrollment_date = '';
            let combo_package = '';
            let demo_start_date = '';
            let potential_enrollment_date = '';
            let enquiry_date = '';

            if (admission_status === 'Enrolled') {
                enrollment_status = getRadio('enrollment_status');
                enrollment_date = formatDate(getVal('enrollment_date'), true); // UNKNOWN if empty
                combo_package = getRadio('combo_package');
            } else if (admission_status === 'Demo') {
                demo_start_date = formatDate(getVal('demo_start_date'));
                potential_enrollment_date = formatDate(getVal('potential_enrollment_date'), true); // UNKNOWN if empty
            } else if (admission_status === 'Enquiry') {
                enquiry_date = formatDate(getVal('enquiry_date'));
            }

            // Build Payload for n8n
            const payload = {
                admission_status,
                first_name,
                last_name,
                gender,
                dob,
                hobbies: hobbies || '',
                grade,
                branch,
                school_name,
                prior_school_name,
                address,
                subjects_opted: selectedSubjects.join(', '),
                primary_contact_name: primary_name,
                primary_contact_phone: primary_number,
                primary_contact_relation: primary_relation,
                primary_language,
                secondary_contact_name: secondary_name,
                secondary_contact_phone: secondary_number,
                secondary_contact_relation: secondary_relation,
                secondary_language,
                enrollment_status,
                enrollment_date,
                combo_package,
                demo_start_date,
                potential_enrollment_date,
                enquiry_date,
                submission_date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            };

            console.log('Submitting Payload:', payload);

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                redirect: 'manual' // Prevent browser from following 302 redirects (avoids CORS errors)
            });

            // redirect:'manual' means a 302 from n8n comes back as type 'opaqueredirect' (status 0)
            // response.ok means n8n returned a normal 200 JSON response
            if (response.ok || response.type === 'opaqueredirect') {
                console.log('Successfully submitted');
                
                // Show 'FORM SUBMITTED' Overlay
                const successOverlay = document.getElementById('successOverlay');
                successOverlay.classList.add('active');

                // Success feedback on button
                const btn = document.getElementById('submitBtn');
                btn.textContent = 'Submitted Successfully';
                btn.style.background = '#00b894';
                btn.disabled = true;

                // If n8n returns JSON with a redirectUrl, handle client-side redirect
                if (response.ok) {
                    try {
                        const data = await response.json();
                        if (data.redirectUrl) {
                            console.log('Redirecting to:', data.redirectUrl);
                            setTimeout(() => { window.location.href = data.redirectUrl; }, 1500);
                        }
                    } catch(e) { /* No JSON body - that's fine */ }
                }
            } else {
                throw new Error('Server responded with ' + response.status);
            }

        } catch (err) {
            console.error('Submission Error:', err);
            alert('Error submitting form. Check console.');
        }
    });
});
