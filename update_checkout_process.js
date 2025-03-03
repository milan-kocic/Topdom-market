'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CheckoutPage;
var React = require("react");
var react_1 = require("react");
// Komentarišemo problematične importe dok ne rešimo problem
// import { useAuth } from '@/lib/auth/auth-context';
// import { supabase } from '@/lib/supabase/client';
// import { useApp } from '@/lib/context/AppContext';
var react_hot_toast_1 = require("react-hot-toast");
function CheckoutPage() {
    // const { user, userProfile } = useAuth();
    // const { state } = useApp();
    // const { cart } = state;
    // const totalPrice = cart.reduce(
    //   (total, item) => total + item.cena * item.quantity,
    //   0
    // );
    var _this = this;
    // Privremene vrednosti za demonstraciju
    var user = null;
    var cart = [];
    var totalPrice = 0;
    var supabase = {
        from: function () { return ({ update: function () { return ({ eq: function () { return ({ error: null }); } }); } }); },
        rpc: function () { return ({ error: null, data: null }); }
    };
    var clearCart = function () {
        // Implementacija clearCart funkcije
    };
    var _a = (0, react_1.useState)(false), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)({
        ime_kupca: '',
        prezime_kupca: '',
        email: '',
        adresa: '',
        mesto: '',
        id_post: '',
        telefon: ''
    }), customerData = _b[0], setCustomerData = _b[1];
    // Funkcija za ažuriranje podataka o kupcu
    var handleInputChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setCustomerData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    // Funkcija za validaciju forme
    var validateForm = function () {
        var requiredFields = [
            'ime_kupca',
            'prezime_kupca',
            'adresa',
            'mesto',
            'id_post',
            'telefon'
        ];
        for (var _i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
            var field = requiredFields_1[_i];
            if (!customerData[field]) {
                react_hot_toast_1.default.error("Polje ".concat(field.replace('_', ' '), " je obavezno"));
                return false;
            }
        }
        // Validacija email-a ako je unet
        if (customerData.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
            react_hot_toast_1.default.error('Email adresa nije validna');
            return false;
        }
        return true;
    };
    // Funkcija za slanje porudžbine
    var handleSubmitOrder = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!validateForm())
                return [2 /*return*/];
            // if (cart.length === 0) {
            //   toast.error('Vaša korpa je prazna');
            //   return;
            // }
            setLoading(true);
            try {
                // Ovde bi trebalo da bude kod za kreiranje porudžbine
                // Privremeno komentarišemo kod koji koristi supabase
                /*
                let kupacId = null;
          
                // Prvo kreiramo ili ažuriramo kupca
                try {
                  // Ako je korisnik prijavljen, koristimo njegov ID
                  if (user) {
                    kupacId = user.id;
          
                    // Ažuriramo podatke o korisniku ako su se promenili
                    if (
                      userProfile?.ime_kupca !== customerData.ime_kupca ||
                      userProfile?.prezime_kupca !== customerData.prezime_kupca ||
                      userProfile?.adresa !== customerData.adresa ||
                      userProfile?.mesto !== customerData.mesto ||
                      userProfile?.id_post !== customerData.id_post
                    ) {
                      const { error: updateError } = await supabase
                        .from('kupci')
                        .update({
                          ime_kupca: customerData.ime_kupca,
                          prezime_kupca: customerData.prezime_kupca,
                          adresa: customerData.adresa,
                          mesto: customerData.mesto,
                          id_post: customerData.id_post
                        })
                        .eq('id', user.id);
          
                      if (updateError) {
                        console.error(
                          'Greška pri ažuriranju podataka o kupcu:',
                          updateError
                        );
                        toast.error('Greška pri ažuriranju podataka o kupcu');
                        setLoading(false);
                        return;
                      }
                    }
                  } else {
                    // Ako korisnik nije prijavljen, proveravamo da li postoji kupac sa datim email-om
                    if (customerData.email) {
                      const { data: existingCustomer, error: fetchError } =
                        await supabase.rpc('dohvati_kupca_po_email', {
                          p_email: customerData.email
                        });
          
                      if (fetchError) {
                        console.error('Greška pri proveri postojećeg kupca:', fetchError);
                      } else if (existingCustomer && existingCustomer.length > 0) {
                        // Koristimo postojećeg kupca
                        kupacId = existingCustomer[0].id;
          
                        // Ažuriramo podatke o kupcu
                        const { error: updateError } = await supabase
                          .from('kupci')
                          .update({
                            ime_kupca: customerData.ime_kupca,
                            prezime_kupca: customerData.prezime_kupca,
                            adresa: customerData.adresa,
                            mesto: customerData.mesto,
                            id_post: customerData.id_post
                          })
                          .eq('id', kupacId);
          
                        if (updateError) {
                          console.error(
                            'Greška pri ažuriranju podataka o kupcu:',
                            updateError
                          );
                        }
                      }
                    }
                  }
          
                  // Ako kupac ne postoji, kreiramo novog
                  if (!kupacId) {
                    const { data: newCustomer, error: createError } = await supabase.rpc(
                      'dodaj_kupca',
                      {
                        p_ime_kupca: customerData.ime_kupca,
                        p_prezime_kupca: customerData.prezime_kupca,
                        p_email: customerData.email || null,
                        p_adresa: customerData.adresa,
                        p_mesto: customerData.mesto,
                        p_id_post: customerData.id_post
                      }
                    );
          
                    if (createError) {
                      console.error('Greška pri kreiranju novog kupca:', createError);
                      toast.error('Greška pri kreiranju novog kupca');
                      setLoading(false);
                      return;
                    }
          
                    kupacId = newCustomer;
                  }
          
                  // Kreiramo porudžbinu
                  const { data: orderId, error: orderError } = await supabase.rpc(
                    'kreiraj_porudzbinu',
                    {
                      p_kupac_id: kupacId,
                      p_ukupna_cena: totalPrice + 390, // Dodajemo cenu dostave
                      p_status: 'nova',
                      p_nacin_placanja: paymentMethod,
                      p_telefon: customerData.telefon
                    }
                  );
          
                  if (orderError) {
                    console.error('Greška pri kreiranju porudžbine:', orderError);
                    toast.error('Greška pri kreiranju porudžbine');
                    setLoading(false);
                    return;
                  }
          
                  // Dodajemo stavke porudžbine
                  for (const item of cart) {
                    const { error: itemError } = await supabase.rpc(
                      'dodaj_stavku_porudzbine',
                      {
                        p_porudzbina_id: orderId,
                        p_proizvod_id: item.id,
                        p_kolicina: item.quantity,
                        p_cena_po_komadu: item.cena
                      }
                    );
          
                    if (itemError) {
                      console.error('Greška pri dodavanju stavke porudžbine:', itemError);
                      // Nastavljamo sa dodavanjem ostalih stavki
                    }
                  }
          
                  // Uspešno kreirana porudžbina
                  toast.success('Porudžbina je uspešno kreirana!');
                  clearCart();
                  // Preusmeravanje na stranicu sa potvrdom
                  // router.push(`/porudzbina/${orderId}`);
                } catch (error) {
                  console.error('Greška pri obradi porudžbine:', error);
                  toast.error('Došlo je do greške pri obradi porudžbine');
                }
                */
                // Simuliramo uspešnu porudžbinu
                setTimeout(function () {
                    react_hot_toast_1.default.success('Porudžbina je uspešno kreirana!');
                    clearCart();
                    setLoading(false);
                }, 1500);
            }
            catch (error) {
                console.error('Greška:', error);
                react_hot_toast_1.default.error('Došlo je do greške');
                setLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    return (React.createElement("div", { className: 'container mx-auto py-8' },
        React.createElement("h1", { className: 'text-2xl font-bold mb-6' }, "Zavr\u0161ite kupovinu"),
        React.createElement("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' },
            React.createElement("div", { className: 'bg-white p-6 rounded-lg shadow' },
                React.createElement("h2", { className: 'text-xl font-semibold mb-4' }, "Podaci o kupcu"),
                React.createElement("form", { onSubmit: handleSubmitOrder },
                    React.createElement("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4' },
                        React.createElement("div", null,
                            React.createElement("label", { className: 'block text-sm font-medium text-gray-700 mb-1' }, "Ime*"),
                            React.createElement("input", { type: 'text', name: 'ime_kupca', value: customerData.ime_kupca, onChange: handleInputChange, className: 'w-full px-3 py-2 border border-gray-300 rounded-md', required: true, placeholder: 'Unesite ime kupca' })),
                        React.createElement("div", null,
                            React.createElement("label", { className: 'block text-sm font-medium text-gray-700 mb-1' }, "Prezime*"),
                            React.createElement("input", { type: 'text', name: 'prezime_kupca', value: customerData.prezime_kupca, onChange: handleInputChange, className: 'w-full px-3 py-2 border border-gray-300 rounded-md', required: true, placeholder: 'Unesite prezime kupca' }))),
                    React.createElement("div", { className: 'mb-4' },
                        React.createElement("label", { className: 'block text-sm font-medium text-gray-700 mb-1' },
                            "Email ",
                            !user && '(nije obavezno)'),
                        React.createElement("input", { type: 'email', name: 'email', value: customerData.email, onChange: handleInputChange, className: 'w-full px-3 py-2 border border-gray-300 rounded-md', disabled: !!user, placeholder: 'Unesite email' }),
                        !user && (React.createElement("p", { className: 'text-sm text-gray-500 mt-1' }, "Ako unesete email, mo\u017Eete pratiti status va\u0161e porud\u017Ebine"))),
                    React.createElement("div", { className: 'mb-4' },
                        React.createElement("label", { className: 'block text-sm font-medium text-gray-700 mb-1' }, "Telefon*"),
                        React.createElement("input", { type: 'tel', name: 'telefon', value: customerData.telefon, onChange: handleInputChange, className: 'w-full px-3 py-2 border border-gray-300 rounded-md', required: true, placeholder: 'Unesite telefon' })),
                    React.createElement("div", { className: 'mb-4' },
                        React.createElement("label", { className: 'block text-sm font-medium text-gray-700 mb-1' }, "Adresa*"),
                        React.createElement("input", { type: 'text', name: 'adresa', value: customerData.adresa, onChange: handleInputChange, className: 'w-full px-3 py-2 border border-gray-300 rounded-md', required: true, placeholder: 'Unesite adresu' })),
                    React.createElement("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6' },
                        React.createElement("div", null,
                            React.createElement("label", { className: 'block text-sm font-medium text-gray-700 mb-1' }, "Mesto*"),
                            React.createElement("input", { type: 'text', name: 'mesto', value: customerData.mesto, onChange: handleInputChange, className: 'w-full px-3 py-2 border border-gray-300 rounded-md', required: true, placeholder: 'Unesite mesto' })),
                        React.createElement("div", null,
                            React.createElement("label", { className: 'block text-sm font-medium text-gray-700 mb-1' }, "Po\u0161tanski broj*"),
                            React.createElement("input", { type: 'text', name: 'id_post', value: customerData.id_post, onChange: handleInputChange, className: 'w-full px-3 py-2 border border-gray-300 rounded-md', required: true, placeholder: 'Unesite po\u0161tanski broj' }))),
                    React.createElement("button", { type: 'submit', className: 'w-full bg-yellow-500 text-white py-3 px-4 rounded-md font-medium hover:bg-yellow-600 transition-colors', disabled: loading }, loading ? 'Obrada...' : 'Potvrdite porudžbinu'))),
            React.createElement("div", { className: 'bg-white p-6 rounded-lg shadow' },
                React.createElement("h2", { className: 'text-xl font-semibold mb-4' }, "Va\u0161a korpa"),
                cart.length === 0 ? (React.createElement("p", { className: 'text-gray-500' }, "Va\u0161a korpa je prazna")) : (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: 'space-y-4 mb-6' }, cart.map(function (item) { return (React.createElement("div", { key: item.id, className: 'flex items-center border-b pb-4' },
                        React.createElement("div", { className: 'w-16 h-16 flex-shrink-0' },
                            React.createElement("img", { src: item.glavna_slika, alt: item.naziv_proizvoda, className: 'w-full h-full object-cover rounded' })),
                        React.createElement("div", { className: 'ml-4 flex-grow' },
                            React.createElement("h3", { className: 'font-medium' }, item.naziv_proizvoda),
                            React.createElement("p", { className: 'text-gray-500' },
                                item.quantity,
                                " x ",
                                item.cena.toLocaleString(),
                                " RSD")),
                        React.createElement("div", { className: 'font-semibold' },
                            (item.quantity * item.cena).toLocaleString(),
                            " RSD"))); })),
                    React.createElement("div", { className: 'border-t pt-4' },
                        React.createElement("div", { className: 'flex justify-between mb-2' },
                            React.createElement("span", null, "Ukupno proizvodi:"),
                            React.createElement("span", { className: 'font-semibold' },
                                totalPrice.toLocaleString(),
                                " RSD")),
                        React.createElement("div", { className: 'flex justify-between mb-2' },
                            React.createElement("span", null, "Dostava:"),
                            React.createElement("span", { className: 'font-semibold' }, "390 RSD")),
                        React.createElement("div", { className: 'flex justify-between text-lg font-bold mt-2 pt-2 border-t' },
                            React.createElement("span", null, "UKUPNO:"),
                            React.createElement("span", { className: 'text-yellow-600' },
                                (totalPrice + 390).toLocaleString(),
                                " RSD")))))))));
}
