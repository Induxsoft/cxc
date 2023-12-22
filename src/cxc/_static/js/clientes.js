var cliente =
{
    tableId: "", table: null,

    init()
    {
        if (this.tableId.trim() != "") { this.table = document.getElementById(this.tableId); }
    },

    goTo(url)
    {
        if (!url) { alert("No se ha indicado un destino."); return; }
        if (!this.table) { alert("No se encontro una definición de tabla (edit-table)."); return; }
        if (this.table.CurrentRowIndex() < 0) { alert("Debe seleccionar una fila"); return; }

        var data = this.table.DataArray[this.table.CurrentRowIndex()];
        window.location.href = url.replace("{_cliente}",data.sys_pk);
    },

    list: {
        tbl_clientes: null,
        txt_search_cliente: null,
        btn_search_cliente: null,
        btn_new_cliente: null,

        init()
        {
            this.txt_search_cliente = document.getElementById("txt_search_cliente");
            this.btn_search_cliente = document.getElementById("btn_search_cliente");
            this.btn_new_cliente = document.getElementById("btn_new_cliente");
            this.tbl_clientes = document.getElementById("tbl_clientes");

            if (this.txt_search_cliente) {
                this.txt_search_cliente.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") this.buscarCliente();
                });
            }
            if (this.btn_search_cliente) {
                this.btn_search_cliente.addEventListener("click", () => { this.buscarCliente(); });
            }
        },

        buscarCliente() {
            let text = this.txt_search_cliente.value.trim();
            let url = this.txt_search_cliente.getAttribute("data-url-search").trim();
            if (!text) return;
            if (!url) { alert("No se indico un destino"); return; }
            if (!this.tbl_clientes) { alert("No se ha definido la tabla de clientes."); return; }
            url = url.replace("@search",text);
            
            let onSuccess = (data) => {
                if (data.message) { alert(data.message); }
    
                this.tbl_clientes.DataArray = data;
                this.tbl_clientes._printRows();
            }
            let onFailure = (error) => {
                alert('No se pudo realizar la busqueda.\n' + JSON.stringify(error));
            }
    
            InduxsoftCrudlModel.InvokeService(url,null,onSuccess,onFailure,"GET",false);
        }
    },

    form: {
        formCliente: null,
        fcElements: null,
        btnSave: null,
        
        init()
        {
            this.formCliente = document.getElementById("form_cliente");
            this.btnSave = document.getElementById("btn_save");
            this.setEvents();
        },

        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { this.saveForm(); }); }
            if (this.formCliente) {
                this.fcElements = this.formCliente.elements;

                this.fcElements["chq_domicilio1"].addEventListener("change", (event) => {
                    let domicilio1 = document.getElementById("cbody_domicilio1");
                    (event.target.checked) ? domicilio1.classList.remove("disable-form") : domicilio1.classList.add("disable-form");
                });
                this.fcElements["chq_domicilio2"].addEventListener("change", (event) => {
                    let domicilio2 = document.getElementById("cbody_domicilio2");
                    (event.target.checked) ? domicilio2.classList.remove("disable-form") : domicilio2.classList.add("disable-form");
                });
                this.fcElements["chq_domicilio3"].addEventListener("change", (event) => {
                    let domicilio3 = document.getElementById("cbody_domicilio3");
                    (event.target.checked) ? domicilio3.classList.remove("disable-form") : domicilio3.classList.add("disable-form");
                });
                this.fcElements["chq_otorgar_credito"].addEventListener("change", (event) => {
                    let div_credito = document.getElementById("div_otorgar_credito");
                    (event.target.checked) ? div_credito.classList.remove("disable-form") : div_credito.classList.add("disable-form");
                });
                this.fcElements["rd_credito_ilimitado"].addEventListener("change", (event) => {
                    this.fcElements["limitecredito"].type = "hidden";
                });
                this.fcElements["rd_credito_limitado"].addEventListener("change", (event) => {
                    this.fcElements["limitecredito"].type = "number";
                });
            }
        },

        saveForm(){
            if (!this.formCliente.reportValidity()) return;

            this.formCliente.submit();
        },
    },
}