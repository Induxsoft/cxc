var notif = {
    
    form_id: "",
    urlexit: "..",
    
    init()
    {
        const form = document.getElementById(this.form_id);
        const type = document.getElementById('tipo');
        const channel = document.getElementById('canal');
        const to = document.getElementById('para');

        form.addEventListener('submit', e => {
            e.preventDefault();
            this._submit(e.target);
        });

        channel.addEventListener('change', e => {
            let url = window.location.href;
            let qry = (new URLSearchParams(this.formObj(form))).toString();

            window.location.href = url + (url.includes('?') ? '&' : '?') + qry;
        });

        const channel_recipient = document.querySelector('#form-params input[name="to"]');
        to.addEventListener('change', (e) => {
            if (channel_recipient) {
                channel_recipient.value = (e.target.value != "") ? "{{recipient}}" : "";
            }
        });

        this.initTableVars();
        this.initSuggestMarks();
    },

    initTableVars()
    {
        const table = document.getElementById('table-vars');
        if (!table) return;

        const input = document.querySelector('input[name="tempvars"]');
        table.DataArray = JSON.parse(input.value || "[]");
        table._printRows();

        document.getElementById('btn-add-var')
        .addEventListener('click', () => table.AddRow());
        
        document.getElementById('btn-del-var')
        .addEventListener('click', () => table.DeleteCurrentRow());

        table.Events['rowdeleted'] = function(e) {
            input.value = JSON.stringify(e.sender.DataArray);
        }
        table.Events['fieldupdated'] = function(e) {
            input.value = JSON.stringify(e.sender.DataArray);
        }
    },

    initSuggestMarks()
    {
        macros.vars = {
            customer_code: {
                label: "Código del cliente",
                aliases: ["cliente_codigo"]
            },
            customer_name: {
                label: "Nombre del cliente",
                aliases: ["cliente_nombre"]
            },
            customer_phone: {
                label: "Teléfono del cliente",
                aliases: ["cliente_telefono"]
            },
            customer_email: {
                label: "Correo del cliente",
                aliases: ["cliente_email"]
            },
            billing_contact_name: {
                label: "Nombre del contacto",
                aliases: ["contacto_nombre"]
            },
            recipient: {
                label: "Resolver destinatario según orden de precedencia"
            },
            doc_reference: {
                label: "Referencia del documento",
                aliases: ["doc_referencia"]
            },
            doc_amount: {
                label: "Monto total",
                aliases: ["doc_total"]
            },
            doc_balance: {
                label: "Saldo pendiente",
                aliases: ["doc_saldo"]
            },
            doc_due_date: {
                label: "Fecha de vencimiento",
                aliases: ["doc_vencimiento"]
            },
            doc_currency: {
                label: "Divisa",
                aliases: ["doc_moneda"]
            },
            agreement_due_date: {
                label: "Fecha comprometida"
            },
            agreement_amount: {
                label: "Monto acordado"
            },
            agreement_balance: {
                label: "Saldo del acuerdo"
            }
        };
        macros.suggest("#form-params");
    },

    formObj(formOrId) {
        const form = (typeof formOrId === "string") ? document.getElementById(formOrId) : formOrId;
        return Object.fromEntries(new FormData(form).entries());
    },

    _submit(form)
    {
        const formParams = document.getElementById('form-params');
        if (!formParams.reportValidity()) return;
        
        let payload = this.formObj(form);
        let method = (Number(payload.sys_pk) > 0) ? 'PATCH' : 'POST';
        
        payload.params = this.formObj(formParams);

        InduxsoftCrudlModel.InvokeService('.', payload,
            (data) => {
                window.location.href = this.urlexit;
            },
            (error) => { alert(error.message) },
            method, false
        );
    }
};