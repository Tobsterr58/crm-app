<template>
    <div class="flex w-full h-full">

        <!-- Hlavný obsah (Ľavá strana) -->
        <div class="flex-1 flex flex-col h-full overflow-hidden">
            <header class="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex justify-between items-center z-10">
                <div class="flex items-center gap-6 w-1/2">
                    <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph-fill ph-users-three text-blue-600"></i> Databáza RFO
                    </h1>
                    <div class="relative flex-1">
                        <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Hľadať v akomkoľvek poli (firma, meno, text komentára...)"
                            class="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        >
                    </div>
                </div>
                <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm transition flex items-center gap-2">
                    <i class="ph-bold ph-plus"></i> Nový záznam
                </button>
            </header>

            <div class="flex-1 overflow-y-auto p-8">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th class="p-4 font-semibold">Názov firmy</th>
                                <th class="p-4 font-semibold">Stav a Markery</th>
                                <th class="p-4 font-semibold">Lokalita</th>
                                <th class="p-4 font-semibold">Obchodné prípady</th>
                                <th class="p-4 font-semibold text-right">Posledná zmena</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="company in filteredCompanies"
                                :key="company.id"
                                @click="handleCompanyClick(company)"
                                class="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition group"
                            >
                                <td class="p-4">
                                    <div class="font-bold text-slate-800 group-hover:text-blue-700">{{ company.name }}</div>
                                    <div class="text-xs text-slate-500">{{ company.web }}</div>
                                </td>
                                <td class="p-4">
                                    <div class="flex flex-wrap gap-1.5">
                                        <span class="px-2 py-0.5 rounded text-xs font-bold border" :class="getStatusColor(company.status)">
                                            {{ company.status }}
                                        </span>
                                        <span v-for="marker in company.markers" :key="marker" class="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                                            {{ marker }}
                                        </span>
                                    </div>
                                </td>
                                <td class="p-4 text-sm text-slate-600">{{ company.city }}, {{ company.state }}</td>
                                <td class="p-4">
                                    <span class="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium border border-slate-200">
                                        {{ company.opportunities.length }} aktívne
                                    </span>
                                </td>
                                <td class="p-4 text-right text-sm text-slate-500">
                                    <div class="font-medium text-slate-700">{{ company.lastUpdatedDate }}</div>
                                    <div class="text-xs">{{ company.lastUpdatedBy }}</div>
                                </td>
                            </tr>
                            <tr v-if="filteredCompanies.length === 0">
                                <td colspan="5" class="p-8 text-center text-slate-400">Nenašli sa žiadne záznamy.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Bočný panel -->
        <div class="w-96 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.02)] z-20">
            <div class="p-5 border-b border-slate-200 bg-slate-50">
                <h2 class="font-bold text-slate-800 flex items-center gap-2">
                    <i class="ph-fill ph-clock-counter-clockwise text-blue-500"></i> Nedávna aktivita
                </h2>
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <div v-for="(log, index) in globalHistory" :key="index" class="relative pl-4 border-l-2 border-blue-200">
                    <div class="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500"></div>
                    <div class="text-xs text-slate-500 flex justify-between mb-1">
                        <span class="font-bold text-slate-700">{{ log.companyName }}</span>
                        <span>{{ log.date }}</span>
                    </div>
                    <div class="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        <span class="font-semibold text-xs text-blue-700 block mb-1">{{ log.author }} píše:</span>
                        {{ log.text }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: Výber obchodného prípadu -->
        <div v-if="isOpportunitySelectorOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div class="bg-blue-600 px-6 py-4">
                    <h3 class="text-xl font-bold text-white">Výber obchodného prípadu</h3>
                    <p class="text-blue-100 text-sm mt-1">{{ activeCompany.name }} má viacero otvorených prípadov.</p>
                </div>
                <div class="p-6 space-y-3">
                    <button
                        v-for="opp in activeCompany.opportunities"
                        :key="opp.id"
                        @click="selectOpportunityAndOpenModal(opp)"
                        class="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition flex justify-between items-center group"
                    >
                        <div>
                            <div class="font-bold text-slate-800 group-hover:text-blue-700">{{ opp.name }}</div>
                            <div class="text-xs text-slate-500 mt-1">Stav: {{ opp.status }}</div>
                        </div>
                        <i class="ph-bold ph-caret-right text-slate-400 group-hover:text-blue-500"></i>
                    </button>
                    <button @click="selectOpportunityAndOpenModal(null)" class="w-full text-left p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-500 text-slate-600 transition flex items-center gap-2 mt-4">
                        <i class="ph-bold ph-plus"></i> Vytvoriť nový obchodný prípad
                    </button>
                </div>
                <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right">
                    <button @click="isOpportunitySelectorOpen = false" class="text-slate-600 hover:text-slate-800 font-medium">Zrušiť</button>
                </div>
            </div>
        </div>

        <!-- Veľký Modal (Detail firmy / Editácia) -->
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col">

                <div class="bg-slate-50 border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0 rounded-t-2xl">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            {{ isEditing ? activeCompany.name : 'Vytvoriť nový záznam' }}
                            <span v-if="selectedOpportunity" class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-semibold border border-blue-200">
                                Prípad: {{ selectedOpportunity.name }}
                            </span>
                        </h2>
                        <div class="text-sm text-slate-500 mt-1" v-if="isEditing">
                            Založil: <strong class="text-slate-700">{{ activeCompany.createdBy }}</strong>
                            | Pôvod kontaktu: <strong class="text-slate-700">{{ activeCompany.origin || 'Nezadané' }}</strong>
                        </div>
                    </div>
                    <button @click="closeModal" class="text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-full p-2 transition text-xl shadow-sm border border-slate-200 w-10 h-10 flex items-center justify-center">
                        <i class="ph-bold ph-x"></i>
                    </button>
                </div>

                <div class="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto grow bg-white">

                    <!-- Stĺpec 1: Firemné údaje -->
                    <div class="col-span-4 space-y-6">
                        <h3 class="font-bold text-lg border-b border-slate-200 pb-2 text-slate-800 flex items-center gap-2">
                            <i class="ph-fill ph-buildings text-slate-400"></i> Firemné údaje
                        </h3>
                        <div class="bg-yellow-50/50 p-4 rounded-xl border border-yellow-200/60 space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Názov firmy <span class="text-red-500">*</span></label>
                                <div class="flex gap-2">
                                    <input v-model="activeCompany.name" type="text" :class="{'border-red-500': showValidation && !activeCompany.name}" class="w-full border-slate-300 rounded-lg shadow-sm p-2.5 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium">
                                    <button class="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2.5 rounded-lg text-sm whitespace-nowrap shadow-sm transition flex items-center gap-1" title="Prepojenie na ARES/Money">
                                        <i class="ph-bold ph-database"></i> ARES
                                    </button>
                                </div>
                                <p v-if="showValidation && !activeCompany.name" class="text-red-500 text-xs mt-1">Toto pole je povinné.</p>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Kto vytvoril <span class="text-red-500">*</span></label>
                                    <input v-model="activeCompany.createdBy" type="text" :class="{'border-red-500': showValidation && !activeCompany.createdBy}" class="w-full border-slate-300 rounded-lg shadow-sm p-2.5 border bg-white">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Pôvod (Doporučenie...)</label>
                                    <input v-model="activeCompany.origin" type="text" placeholder="Napr. Veletrh InnoTrans" class="w-full border-slate-300 rounded-lg shadow-sm p-2.5 border bg-white">
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Stav spolupráce</label>
                                <select v-model="activeCompany.status" class="w-full border-slate-300 rounded-lg shadow-sm p-2.5 border font-semibold bg-slate-50">
                                    <option>MOŽNÁ</option>
                                    <option>V JEDNÁNÍ</option>
                                    <option>ZÁKAZNÍK</option>
                                    <option>ZAMÍTNUTO</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Markery</label>
                                <div class="flex flex-col gap-1 mt-1">
                                    <label class="flex items-center gap-2 text-sm"><input type="checkbox" value="Prozkoumat" v-model="activeCompany.markers" class="rounded text-purple-600"> Prozkoumat</label>
                                    <label class="flex items-center gap-2 text-sm"><input type="checkbox" value="V jednání" v-model="activeCompany.markers" class="rounded text-purple-600"> V jednání</label>
                                </div>
                            </div>
                        </div>

                        <div v-if="activeCompany.status === 'ZÁKAZNÍK' || isEditing" class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Obchodné štatistiky (Z ERP)</h4>
                            <div class="grid grid-cols-3 gap-2">
                                <div class="bg-white p-2 rounded border border-slate-100 text-center shadow-sm">
                                    <div class="text-[10px] text-slate-400 uppercase font-bold">Obrat</div>
                                    <div class="font-bold text-slate-800">{{ activeCompany.turnover || '0' }}</div>
                                </div>
                                <div class="bg-white p-2 rounded border border-slate-100 text-center shadow-sm">
                                    <div class="text-[10px] text-slate-400 uppercase font-bold">Objednávky</div>
                                    <div class="font-bold text-slate-800">{{ activeCompany.ordersCount || 0 }}</div>
                                </div>
                                <div class="bg-white p-2 rounded border border-slate-100 text-center shadow-sm">
                                    <div class="text-[10px] text-slate-400 uppercase font-bold">Poptávky</div>
                                    <div class="font-bold text-slate-800">{{ activeCompany.inquiriesCount || 0 }}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Mesto / Štát</label>
                            <div class="flex gap-2">
                                <input v-model="activeCompany.city" type="text" placeholder="Mesto" class="w-2/3 border-slate-300 rounded-lg shadow-sm p-2.5 border">
                                <input v-model="activeCompany.state" type="text" placeholder="Štát" class="w-1/3 border-slate-300 rounded-lg shadow-sm p-2.5 border">
                            </div>
                        </div>
                    </div>

                    <!-- Stĺpec 2: Kontakty -->
                    <div class="col-span-4 space-y-6">
                        <h3 class="font-bold text-lg border-b border-slate-200 pb-2 text-slate-800 flex items-center gap-2">
                            <i class="ph-fill ph-users text-slate-400"></i> Kontaktné osoby
                        </h3>
                        <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <div v-for="(contact, index) in activeCompany.contacts" :key="index" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                                <button @click="removeContactPerson(index)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" title="Odstrániť kontakt">
                                    <i class="ph-bold ph-trash"></i>
                                </button>
                                <input v-model="contact.name" placeholder="Meno a priezvisko" class="w-full mb-2 p-2 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none bg-slate-50 rounded transition font-semibold text-slate-800">
                                <input v-model="contact.role" placeholder="Pozícia / Oddelenie" class="w-full mb-3 p-2 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none bg-slate-50 rounded transition text-sm">
                                <div class="flex flex-col gap-2">
                                    <div class="flex items-center gap-2">
                                        <i class="ph-fill ph-phone text-slate-400"></i>
                                        <input v-model="contact.phone" placeholder="Telefón" class="w-full p-1.5 border border-slate-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <i class="ph-fill ph-envelope-simple text-slate-400"></i>
                                        <input v-model="contact.email" placeholder="E-mail" type="email" class="w-full p-1.5 border border-slate-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button @click="addContactPerson" class="w-full py-2.5 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-2 font-medium">
                            <i class="ph-bold ph-plus"></i> Pridať kontaktnú osobu
                        </button>
                    </div>

                    <!-- Stĺpec 3: História a Komentáre -->
                    <div class="col-span-4 space-y-4 flex flex-col h-full">
                        <div class="flex justify-between items-end border-b border-slate-200 pb-2">
                            <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <i class="ph-fill ph-chat-circle-text text-slate-400"></i> Záznamy z jednaní
                            </h3>
                            <span class="text-xs text-slate-500 font-medium">Prípad: {{ selectedOpportunity ? selectedOpportunity.name : 'Všeobecné' }}</span>
                        </div>
                        <div class="flex-grow overflow-y-auto space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[300px] shadow-inner custom-scrollbar">
                            <div v-if="filteredHistory.length === 0" class="text-slate-400 text-center py-8 text-sm flex flex-col items-center gap-2">
                                <i class="ph-fill ph-folder-open text-3xl opacity-50"></i>
                                Pre tento prípad nie sú žiadne záznamy.
                            </div>
                            <div v-for="(log, index) in filteredHistory" :key="index" class="bg-white p-3.5 rounded-lg shadow-sm border border-slate-200 text-sm">
                                <div class="flex justify-between items-center text-slate-500 mb-2 border-b border-slate-100 pb-2">
                                    <div class="flex items-center gap-2">
                                        <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">{{ log.author.substring(0,2).toUpperCase() }}</div>
                                        <strong class="text-slate-700">{{ log.author }}</strong>
                                    </div>
                                    <span class="text-xs">{{ log.date }}</span>
                                </div>
                                <p class="text-slate-700 whitespace-pre-wrap leading-relaxed">{{ log.text }}</p>
                            </div>
                        </div>
                        <div class="mt-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                            <textarea v-model="newCommentText" placeholder="Zadajte poznámku, výsledok hovoru alebo posun v obchode..." class="w-full border-slate-300 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none" rows="3"></textarea>
                            <div class="flex justify-between items-center mt-3">
                                <div class="flex items-center gap-2 text-sm text-slate-500">
                                    <span>Autor:</span>
                                    <input v-model="newCommentAuthor" type="text" class="border-b border-slate-300 w-24 p-1 text-slate-800 font-semibold focus:outline-none focus:border-blue-500">
                                </div>
                                <button @click="addComment" :disabled="!newCommentText" class="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg shadow-sm text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    <i class="ph-bold ph-paper-plane-right"></i> Odoslať
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-50 border-t border-slate-200 px-8 py-4 flex justify-between items-center shrink-0 rounded-b-2xl">
                    <button v-if="isEditing" @click="deleteCompany" class="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition font-medium flex items-center gap-2">
                        <i class="ph-bold ph-trash"></i> Odstrániť záznam
                    </button>
                    <div v-else></div>
                    <div class="flex gap-3">
                        <button @click="closeModal" class="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition shadow-sm">Zrušiť</button>
                        <button @click="saveCompany" class="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md font-bold transition flex items-center gap-2">
                            <i class="ph-bold ph-floppy-disk"></i> {{ isEditing ? 'Uložiť všetky zmeny' : 'Vytvoriť firemný záznam' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchQuery = ref('');

const companies = ref([
    {
        id: 1,
        name: 'REGONIK s.r.o.',
        web: 'http://www.regonik.sk',
        state: 'SK',
        city: 'Bratislava',
        createdBy: 'JL',
        origin: 'Veletrh',
        turnover: '100mil Kč',
        ordersCount: 2,
        inquiriesCount: 5,
        status: 'MOŽNÁ',
        markers: ['Prozkoumat'],
        lastUpdatedDate: '04.05.2026',
        lastUpdatedBy: 'Španěl R.',
        opportunities: [
            { id: 101, name: 'Projekt ČD WiFi 2025', status: 'Otvorené' },
            { id: 102, name: 'Dodávka switchov Lantech', status: 'V realizácii' }
        ],
        contacts: [
            { id: 1, name: 'Martin Hruškovič', role: 'Executive Director', phone: '+421914700593', email: 'martin.hruskovic@regonik.sk' }
        ],
        history: [
            { oppId: 101, date: '04.05.2026', author: 'Španěl R.', text: 'Krátký telefonát s dotazem na projekty. Aktuálně nevidí projekt.' },
            { oppId: 102, date: '12.11.2024', author: 'Španěl R.', text: 'Pan Hruškovič se rozhodl jít s konkurenčním řešením.' }
        ]
    },
    {
        id: 2,
        name: 'SITEL',
        web: 'https://www.sitel.si',
        state: 'SI',
        city: 'Maribor',
        createdBy: 'PH',
        origin: 'Doporučenie',
        turnover: '-',
        ordersCount: 0,
        inquiriesCount: 1,
        status: 'ZÁKAZNÍK',
        markers: ['V jednání'],
        lastUpdatedDate: '30.07.2024',
        lastUpdatedBy: 'PH',
        opportunities: [
            { id: 201, name: 'Všeobecná spolupráca', status: 'Otvorené' }
        ],
        contacts: [
            { id: 3, name: 'Janez Novak', role: 'Manager', phone: '+386 40 123 456', email: 'janez@sitel.si' }
        ],
        history: [
            { oppId: 201, date: '30.07.2024', author: 'PH', text: 'Založenie záznamu a prvý kontakt.' }
        ]
    }
]);

const isModalOpen = ref(false);
const isOpportunitySelectorOpen = ref(false);
const isEditing = ref(false);
const activeCompany = ref(null);
const selectedOpportunity = ref(null);
const showValidation = ref(false);
const newCommentText = ref('');
const newCommentAuthor = ref('JL');

const filteredCompanies = computed(() => {
    if (!searchQuery.value) return companies.value;
    const q = searchQuery.value.toLowerCase();
    return companies.value.filter(c => JSON.stringify(c).toLowerCase().includes(q));
});

const globalHistory = computed(() => {
    let allLogs = [];
    companies.value.forEach(company => {
        company.history.forEach(log => {
            allLogs.push({ ...log, companyName: company.name });
        });
    });
    return allLogs.reverse().slice(0, 10);
});

const filteredHistory = computed(() => {
    if (!activeCompany.value) return [];
    if (!selectedOpportunity.value) return activeCompany.value.history;
    return activeCompany.value.history.filter(h => h.oppId === selectedOpportunity.value.id || !h.oppId);
});

const getStatusColor = (status) => {
    const colors = {
        'MOŽNÁ': 'bg-blue-100 text-blue-700 border-blue-200',
        'V JEDNÁNÍ': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'ZÁKAZNÍK': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'ZAMÍTNUTO': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
};

const getEmptyCompany = () => ({
    id: null,
    name: '', createdBy: newCommentAuthor.value, origin: '', web: '', state: 'CZ', city: '',
    turnover: '', ordersCount: 0, inquiriesCount: 0,
    status: 'MOŽNÁ', markers: [],
    opportunities: [{ id: Date.now(), name: 'Nový obchodný prípad', status: 'Otvorené' }],
    contacts: [{ name: '', role: '', phone: '', email: '' }],
    history: []
});

const handleCompanyClick = (company) => {
    activeCompany.value = JSON.parse(JSON.stringify(company));
    isEditing.value = true;
    showValidation.value = false;
    if (activeCompany.value.opportunities && activeCompany.value.opportunities.length > 1) {
        isOpportunitySelectorOpen.value = true;
    } else {
        selectedOpportunity.value = activeCompany.value.opportunities[0] || null;
        isModalOpen.value = true;
    }
};

const selectOpportunityAndOpenModal = (opp) => {
    if (opp === null) {
        const newOpp = { id: Date.now(), name: 'Nový prípad ' + (activeCompany.value.opportunities.length + 1), status: 'Otvorené' };
        activeCompany.value.opportunities.push(newOpp);
        selectedOpportunity.value = newOpp;
    } else {
        selectedOpportunity.value = opp;
    }
    isOpportunitySelectorOpen.value = false;
    isModalOpen.value = true;
};

const openModal = () => {
    isEditing.value = false;
    showValidation.value = false;
    activeCompany.value = getEmptyCompany();
    selectedOpportunity.value = activeCompany.value.opportunities[0];
    newCommentText.value = '';
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    isOpportunitySelectorOpen.value = false;
    activeCompany.value = null;
    selectedOpportunity.value = null;
};

const addContactPerson = () => {
    activeCompany.value.contacts.push({ name: '', role: '', phone: '', email: '' });
};

const removeContactPerson = (index) => {
    if (activeCompany.value.contacts.length > 1) {
        activeCompany.value.contacts.splice(index, 1);
    }
};

const addComment = () => {
    if (!newCommentText.value.trim()) return;
    const dz = new Date();
    const dateStr = `${dz.getDate().toString().padStart(2,'0')}.${(dz.getMonth()+1).toString().padStart(2,'0')}.${dz.getFullYear()}`;
    activeCompany.value.history.unshift({
        oppId: selectedOpportunity.value ? selectedOpportunity.value.id : null,
        date: dateStr,
        author: newCommentAuthor.value || 'Neznámy',
        text: newCommentText.value
    });
    activeCompany.value.lastUpdatedDate = dateStr;
    activeCompany.value.lastUpdatedBy = newCommentAuthor.value;
    newCommentText.value = '';
};

const saveCompany = () => {
    if (!activeCompany.value.name || !activeCompany.value.createdBy) {
        showValidation.value = true;
        return;
    }
    if (isEditing.value) {
        const index = companies.value.findIndex(c => c.id === activeCompany.value.id);
        companies.value[index] = activeCompany.value;
    } else {
        activeCompany.value.id = Date.now();
        companies.value.push(activeCompany.value);
    }
    closeModal();
};

const deleteCompany = () => {
    if (confirm(`Vymazať záznam ${activeCompany.value.name}?`)) {
        companies.value = companies.value.filter(c => c.id !== activeCompany.value.id);
        closeModal();
    }
};
</script>

<style>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>
