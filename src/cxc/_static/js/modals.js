var modals =
{
    tcliente:
    {
        modal: null, form: null, elements: null, btnSave: null, btnCancel: null,

        init()
        {
            this.modal = document.getElementById("mdl_tcliente");
            this.form = document.getElementById("mdl_tcliente_form");
            this.elements = this.form.elements;
            this.btnSave = document.getElementById("btn_save_mdl_tcliente");
            this.btnCancel = document.getElementById("btn_cancel_mdl_tcliente");
            this.setEvents();
        },

        setEvents()
        {
            this.btnSave.addEventListener("click", (event) => { modals.save(this.form); });
            this.btnCancel.addEventListener("click", (event) => { modals.cancel(this.form); });

            this.modal.addEventListener("shown.bs.modal", (event) => {
                let btnOpen = event.relatedTarget;
                let urlSearch = btnOpen.getAttribute("data-url-search");
                let relId = btnOpen.getAttribute("data-for");

                if (urlSearch && relId)
                {
                    const el = document.getElementById(relId);
                    let url = urlSearch.replace("search","id");
                    url = InduxsoftCrudlModel.UrlReplace(url,{id:el.value});
                    
                    let onSuccess = (data) => {
                        if (data.message) { alert(data.message); return; }
                        modals.setValues(this.form,data)
                    }
                    let onFailure = (error) => { console.error(error); }
                    InduxsoftCrudlModel.InvokeService(url,null,onSuccess,onFailure,"GET",false,false);
                }
            });
        },
    },

    getIns(modalId)
    {
        const refModal = document.getElementById(modalId);
        const insModal = bootstrap.Modal.getInstance(refModal);
        return insModal
    },

    open(modalId){ this.getIns(modalId).show(); },
    close(modalId){ this.getIns(modalId).hide(); },

    setValues(form,data)
    {
        Object.entries(data).forEach(entry => {
            const [key,value] = entry;

            if (form.elements[key]) form.elements[key].value = value;
        });
    },

    save(form)
    {
        if (!form.reportValidity()) return;

        let modalId = form.id.replace("_form","");
        let fd = new FormData(form);
        
        let onSuccess = (data) => {
            if (data.message) { alert(data.message); return; }

            console.log(data);
            this.close(modalId);
        }
        let onFailure = (error) => { console.error(error); }

        InduxsoftCrudlModel.InvokeService(form.action,fd,onSuccess,onFailure,"POST",false,false,"",true);
    },

    cancel(form)
    {
        let modalId = form.id.replace("_form","");
        form.reset();
        this.close(modalId);
    },
}