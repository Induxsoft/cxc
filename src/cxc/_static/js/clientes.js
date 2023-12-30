var cliente =
{
    tableId: "", table: null,

    init()
    {
        if (this.tableId.trim() != "") { this.table = document.getElementById(this.tableId); }
    },

    trigger(element,event) {
        if (element) {
            let e = new Event(event);
            element.dispatchEvent(e);
        }
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
        url_buscar_edoprov: "",
        url_buscar_ciudad: "",
        
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
                    if (this.fcElements["sel_estado"].options.length <= 0) this.fillEstados(this.fcElements["sel_pais"],this.fcElements["sel_estado"]);
                });
                this.fcElements["sel_pais"].addEventListener("change", () => {
                    this.fillEstados(this.fcElements["sel_pais"],this.fcElements["sel_estado"]);
                });
                this.fcElements["sel_estado"].addEventListener("change", () => {
                    this.fillCiudades(this.fcElements["sel_estado"],this.fcElements["sel_ciudad"]);
                });
                
                this.fcElements["chq_domicilio2"].addEventListener("change", (event) => {
                    let domicilio2 = document.getElementById("cbody_domicilio2");
                    (event.target.checked) ? domicilio2.classList.remove("disable-form") : domicilio2.classList.add("disable-form");
                    if (this.fcElements["sel_estado2"].options.length <= 0) this.fillEstados(this.fcElements["sel_pais2"],this.fcElements["sel_estado2"]);
                });
                this.fcElements["sel_pais2"].addEventListener("change", () => {
                    this.fillEstados(this.fcElements["sel_pais2"],this.fcElements["sel_estado2"]);
                });
                this.fcElements["sel_estado2"].addEventListener("change", () => {
                    this.fillCiudades(this.fcElements["sel_estado2"],this.fcElements["sel_ciudad2"]);
                });

                this.fcElements["chq_domicilio3"].addEventListener("change", (event) => {
                    let domicilio3 = document.getElementById("cbody_domicilio3");
                    (event.target.checked) ? domicilio3.classList.remove("disable-form") : domicilio3.classList.add("disable-form");
                    if (this.fcElements["sel_estado3"].options.length <= 0) this.fillEstados(this.fcElements["sel_pais3"],this.fcElements["sel_estado3"]);
                });
                this.fcElements["sel_pais3"].addEventListener("change", () => {
                    this.fillEstados(this.fcElements["sel_pais3"],this.fcElements["sel_estado3"]);
                });
                this.fcElements["sel_estado3"].addEventListener("change", () => {
                    this.fillCiudades(this.fcElements["sel_estado3"],this.fcElements["sel_ciudad3"]);
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

        fillEstados(ref,out){
            let url = this.url_buscar_edoprov.replace("search","ipais");
            url = InduxsoftCrudlModel.UrlReplace(url,{ipais:ref.value});

            let onSuccess = (data) => {
                if (data.message) {
                    console.error(data.message);
                    return;
                }

                out.innerHTML = "";
                data.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.sys_pk;
                    option.text = item.text;

                    out.appendChild(option);
                });
                cliente.trigger(out,"change");
            }
            let onFailure = (error) => { console.error(error) }
            InduxsoftCrudlModel.InvokeService(url,null,onSuccess,onFailure,"GET",false,false);
        },

        fillCiudades(ref,out){
            let url = this.url_buscar_ciudad.replace("search","iestado");
            url = InduxsoftCrudlModel.UrlReplace(url,{iestado:ref.value});

            let onSuccess = (data) => {
                if (data.message) {
                    console.error(data.message);
                    return;
                }

                out.innerHTML = "";
                data.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.sys_pk;
                    option.text = item.text;

                    out.appendChild(option);
                });
            }
            let onFailure = (error) => { console.error(error) }
            InduxsoftCrudlModel.InvokeService(url,null,onSuccess,onFailure,"GET",false,false);
        },

        saveForm(){
            if (!this.formCliente.reportValidity()) return;

            this.formCliente.submit();
        },
    },

    cobro: {
        formCobro: null,
        elements: null,
        btnSave: null,
        dtCliente: {},
        dvsPred: {},

        init()
        {
            this.formCobro = document.getElementById("form_cobro");
            this.btnSave = document.getElementById("btn_save");
            this.setEvents();
        },

        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { this.saveForm(); }); }
            if (this.formCobro) {
                this.elements = this.formCobro.elements;

                this.elements["sel_cuenta_deposito"].addEventListener("change", (event) => {
                    let option = event.target.options[event.target.selectedIndex];
                    let codigo = option.getAttribute("data-divisa").toUpperCase();
                    let cambio = Number(option.getAttribute("data-tcambio"));

                    this.pedirTCambio();

                    this.elements["txt_tcambio_deposito"].value = cambio;
                    cliente.trigger(this.elements["txt_tcambio_deposito"],"change");
                });
                
                this.elements["txt_tcambio_deposito"].addEventListener("change", (event) => {
                    let tcambio_dep = Number(event.target.value);
                    let tcambio_cte = Number(this.elements["txt_tcambio"].value);
                    
                    let importe_cte = Number(this.elements["txt_importe"].value);
                    let importe_dep = Math.mul(importe_cte,tcambio_cte);
                    importe_dep = Math.div(importe_dep,tcambio_dep);
                    
                    this.elements["txt_importe_deposito"].value = importe_dep;
                });
                this.elements["txt_importe_deposito"].addEventListener("change", (event) => {
                    let tcambio_cte = Number(this.elements["txt_tcambio"].value);
                    let tcambio_dep = Number(this.elements["txt_tcambio_deposito"].value);
                    
                    let importe_dep = Number(event.target.value);
                    let importe_cte = Math.mul(importe_dep,tcambio_dep);
                    importe_cte = Math.div(importe_cte,tcambio_cte);

                    this.elements["txt_importe"].value = importe_cte;
                });

                this.elements["txt_importe"].addEventListener("change", (event) => {
                    let tcambio_cte = Number(this.elements["txt_tcambio"].value);
                    let tcambio_dep = Number(this.elements["txt_tcambio_deposito"].value);
                    
                    let importe_cte = Number(event.target.value);
                    let importe_dep = Math.mul(importe_cte,tcambio_cte);
                    importe_dep = Math.div(importe_dep,tcambio_dep);

                    this.elements["txt_importe_deposito"].value = importe_dep;
                });
            }
        },

        pedirTCambio(){
            let optCtaR = this.elements["sel_cuenta_deposito"].options[this.elements["sel_cuenta_deposito"].selectedIndex];
            let cDvsPred = (this.dvsPred.codigo).toUpperCase();
            let cDvsProv = (this.dtCliente.divisa).toUpperCase();
            let cDvsCtaR = optCtaR.getAttribute("data-divisa").toUpperCase();

            let hide_tcambio_dep = false;
            let hide_importe_dep = false;
            let hide_tcambio_cte = false;

            let div_tcambio_cte = document.getElementById("div_tcambio");
            let txt_tcambio_cte = document.getElementById("txt_tcambio");
            let txt_importe_cte = document.getElementById("txt_importe");

            let div_tcambio_dep = document.getElementById("div_tcambio_deposito");
            let div_importe_dep = document.getElementById("div_importe_deposito");
            let txt_tcambio_dep = document.getElementById("txt_tcambio_deposito");
            let spn_tcambio_dep = document.getElementById("spn_tcambio_deposito");
            let txt_importe_dep = document.getElementById("txt_importe_deposito");
            let spn_importe_dep = document.getElementById("spn_importe_deposito");

            if (cDvsPred == cDvsProv && cDvsPred == cDvsCtaR)
            {
                txt_tcambio_cte.value = 1;
                txt_tcambio_dep.value = 1;

                hide_tcambio_cte = true;
                hide_tcambio_dep = true;
                hide_importe_dep = true;
            }
            else if (cDvsPred != cDvsProv && cDvsProv == cDvsCtaR)
            {
                let tcambio_cte = Number(txt_tcambio_cte.value);

                txt_tcambio_cte.value = (tcambio_cte <= 0) ? Number(this.dtCliente.tcambio) : tcambio_cte;
                txt_tcambio_dep.value = (tcambio_cte <= 0) ? Number(this.dtCliente.tcambio) : tcambio_cte;

                hide_tcambio_dep = true;
                hide_importe_dep = true;
            }
            else if (cDvsPred == cDvsProv && cDvsPred != cDvsCtaR)
            {
                let tcambio_dep = Number(txt_tcambio_dep.value);

                txt_tcambio_cte.value = 1;
                txt_tcambio_dep.value = (tcambio_dep <= 0) ? Number(optCtaR.getAttribute("data-tcambio")) : tcambio_dep;
                
                spn_tcambio_dep.innerText = cDvsPred + " = 1 " + cDvsCtaR;
                spn_importe_dep.innerText = cDvsCtaR;

                hide_tcambio_cte = true;
            }
            else if (cDvsPred != cDvsProv && cDvsPred == cDvsCtaR)
            {
                let tcambio_cte = Number(txt_tcambio_cte.value);

                txt_tcambio_cte.value = (tcambio_cte <= 0) ? Number(this.dtCliente.tcambio) : tcambio_cte;
                txt_tcambio_dep.value = 1;

                spn_tcambio_dep.innerText = cDvsPred + " = 1 " + cDvsCtaR;
                spn_importe_dep.innerText = cDvsCtaR;

                hide_tcambio_dep = true;
            }
            else if (cDvsPred != cDvsProv && cDvsPred != cDvsCtaR)
            {
                let tcambio_cte = Number(txt_tcambio_cte.value);
                let tcambio_dep = Number(txt_tcambio_dep.value);

                txt_tcambio_cte.value = (tcambio_cte <= 0) ? Number(this.dtCliente.tcambio) : tcambio_cte;
                txt_tcambio_dep.value = (tcambio_dep <= 0) ? Number(optCtaR.getAttribute("data-tcambio")) : tcambio_dep;
                
                spn_tcambio_dep.innerText = cDvsPred + " = 1 " + cDvsCtaR;
                spn_importe_dep.innerText = cDvsCtaR;
            }

            txt_importe_cte.value = Number(txt_importe_cte.value);
            txt_importe_dep.value = Number(txt_importe_dep.value);

            div_tcambio_dep.classList.toggle("d-none",hide_tcambio_dep);
            div_importe_dep.classList.toggle("d-none",hide_importe_dep);
            div_tcambio_cte.classList.toggle("d-none",hide_tcambio_cte);
        },

        saveForm(){
            if (!this.formCobro.reportValidity()) return;
            this.formCobro.submit();
        },
    },

    bonificacion: {
        formBonificacion: null,
        elements: null,
        btnSave: null,

        init()
        {
            this.formBonificacion = document.getElementById("form_bonificacion");
            this.btnSave = document.getElementById("btn_save");
            this.setEvents();
        },

        setEvents()
        {
            if (this.btnSave) { this.btnSave.addEventListener("click", () => { this.saveForm(); }); }
            if (this.formBonificacion) { this.elements = this.formBonificacion.elements; }
        },

        saveForm(){
            if (!this.formBonificacion.reportValidity()) return;
            this.formBonificacion.submit();
        },
    },
}