<template>

    <!-- PŘIHLÁŠENÍ -->
    <div v-if="!isLoggedIn" class="flex w-full h-full items-center justify-center bg-slate-100">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 border border-slate-200">
            <div class="flex flex-col items-center mb-8">
                <img src="https://exporters.czechtrade.gov.cz/getattachment/88ab9bb5-01e2-479e-a2ed-8b2681f49069/PZK_logo_zakladni.jpg?width=600&resizemode=force" alt="PZK Logo" class="h-20 object-contain mb-4">
                <h1 class="text-2xl font-bold text-slate-800">Databáze RFO</h1>
                <p class="text-slate-500 text-sm mt-1">Přihlaste se pro pokračování</p>
            </div>
            <form @submit.prevent="login" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Uživatelské jméno</label>
                    <input v-model="loginUsername" type="text" placeholder="Zadejte jméno" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" autofocus>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Heslo</label>
                    <input v-model="loginPassword" type="password" placeholder="Zadejte heslo" class="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                </div>
                <div v-if="loginError" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
                    <i class="ph-bold ph-warning-circle"></i> Nesprávné jméno nebo heslo.
                </div>
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition flex items-center justify-center gap-2">
                    <i class="ph-bold ph-sign-in"></i> Přihlásit se
                </button>
            </form>
        </div>
    </div>

    <!-- ADMINISTRACE -->
    <div v-else-if="currentView === 'admin'" class="flex flex-col w-full h-full bg-slate-50">
        <header class="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
            <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                <img src="https://exporters.czechtrade.gov.cz/getattachment/88ab9bb5-01e2-479e-a2ed-8b2681f49069/PZK_logo_zakladni.jpg?width=600&resizemode=force" alt="PZK Logo" class="h-7 object-contain">
                Administrace
            </h1>
            <button @click="currentView = 'crm'" class="border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-4 py-2 rounded-lg transition text-sm flex items-center gap-2">
                <i class="ph-bold ph-arrow-left"></i> Zpět do CRM
            </button>
        </header>
        <div class="flex flex-1 overflow-hidden">
            <div class="w-48 bg-white border-r border-slate-200 p-4 space-y-1 shrink-0">
                <button @click="adminTab = 'users'" :class="adminTab === 'users' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'" class="w-full text-left px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition">
                    <i class="ph-fill ph-users"></i> Uživatelé
                </button>
            </div>
            <div class="flex-1 p-8 overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-lg font-bold text-slate-800">Správa uživatelů</h2>
                    <button @click="openUserForm(null)" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
                        <i class="ph-bold ph-plus"></i> Nový uživatel
                    </button>
                </div>
                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th class="p-4 font-semibold">Jméno</th>
                                <th class="p-4 font-semibold">Uživatelské jméno</th>
                                <th class="p-4 font-semibold">Role</th>
                                <th class="p-4 font-semibold text-right">Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users" :key="user.id" class="border-b border-slate-100 hover:bg-slate-50">
                                <td class="p-4 font-medium text-slate-800">{{ user.name }}</td>
                                <td class="p-4 text-slate-600">{{ user.username }}</td>
                                <td class="p-4">
                                    <span :class="user.role === 'admin' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'" class="px-2 py-0.5 rounded text-xs font-bold border uppercase">
                                        {{ user.role === 'admin' ? 'Administrátor' : 'Uživatel' }}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <div class="flex justify-end gap-1">
                                        <button @click="openUserForm(user)" class="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50 transition" title="Upravit"><i class="ph-bold ph-pencil"></i></button>
                                        <button @click="deleteUser(user)" class="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition" title="Smazat"><i class="ph-bold ph-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <!-- User form modal -->
        <div v-if="isUserFormOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div class="bg-blue-600 px-6 py-4">
                    <h3 class="text-xl font-bold text-white">{{ editingUser.id ? 'Upravit uživatele' : 'Nový uživatel' }}</h3>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Jméno</label>
                        <input v-model="editingUser.name" type="text" class="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Uživatelské jméno</label>
                        <input v-model="editingUser.username" type="text" class="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Heslo</label>
                        <input v-model="editingUser.password" type="password" class="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Role</label>
                        <select v-model="editingUser.role" class="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500">
                            <option value="user">Uživatel</option>
                            <option value="admin">Administrátor</option>
                        </select>
                    </div>
                </div>
                <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
                    <button @click="isUserFormOpen = false" class="px-4 py-2 text-slate-600 font-medium hover:text-slate-800">Zrušit</button>
                    <button @click="saveUser" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">Uložit</button>
                </div>
            </div>
        </div>
    </div>

    <!-- CRM HLAVNÍ POHLED -->
    <div v-else class="flex w-full h-full">
        <div class="flex-1 flex flex-col h-full overflow-hidden">
            <header class="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex justify-between items-center z-10">
                <div class="flex items-center gap-6 w-1/2">
                    <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <img src="https://exporters.czechtrade.gov.cz/getattachment/88ab9bb5-01e2-479e-a2ed-8b2681f49069/PZK_logo_zakladni.jpg?width=600&resizemode=force" alt="PZK Logo" class="h-8 object-contain">
                    </h1>
                    <div class="relative flex-1">
                        <i class="ph ph-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                        <input v-model="searchQuery" type="text" placeholder="Hledat v jakémkoliv poli..." class="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-sm flex items-center gap-1.5">
                        <i class="ph-fill ph-user-circle text-blue-500 text-lg"></i>
                        <span class="font-semibold text-slate-700">{{ currentUser.name }}</span>
                    </span>
                    <button v-if="currentUser.role === 'admin'" @click="currentView = 'admin'" class="border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-lg transition text-sm flex items-center gap-1.5">
                        <i class="ph-fill ph-gear"></i> Administrace
                    </button>
                    <button @click="openCompanyManager" class="border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-700 px-3 py-2 rounded-lg transition text-sm flex items-center gap-1.5">
                        <i class="ph-fill ph-buildings"></i> Správa firem
                    </button>
                    <button @click="logout" class="text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 px-3 py-2 rounded-lg transition text-sm flex items-center gap-1">
                        <i class="ph-bold ph-sign-out"></i> Odhlásit
                    </button>
                    <button @click="openRecordModal" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm transition flex items-center gap-2">
                        <i class="ph-bold ph-plus"></i> Nový záznam
                    </button>
                </div>
            </header>

            <div class="flex-1 overflow-y-auto p-8">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th class="p-4 font-semibold">Název firmy</th>
                                <th class="p-4 font-semibold">Stav a Markery</th>
                                <th class="p-4 font-semibold">Lokalita</th>
                                <th class="p-4 font-semibold">Obchodní případy</th>
                                <th class="p-4 font-semibold text-right">Poslední změna</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="rec in filteredRecords" :key="rec.id" @click="handleRecordClick(rec)" class="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition group">
                                <td class="p-4">
                                    <div class="font-bold text-slate-800 group-hover:text-blue-700">{{ getCompanyName(rec.companyId) }}</div>
                                    <div class="text-xs text-slate-500">{{ getCompanyWeb(rec.companyId) }}</div>
                                </td>
                                <td class="p-4">
                                    <div class="flex flex-wrap gap-1.5">
                                        <span class="px-2 py-0.5 rounded text-xs font-bold border" :class="getStatusColor(rec.status)">{{ rec.status }}</span>
                                        <span v-for="marker in rec.markers" :key="marker" class="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">{{ marker }}</span>
                                    </div>
                                </td>
                                <td class="p-4 text-sm text-slate-600">{{ getCompanyLocation(rec.companyId) }}</td>
                                <td class="p-4">
                                    <span class="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium border border-slate-200">{{ rec.opportunities.length }} aktivní</span>
                                </td>
                                <td class="p-4 text-right text-sm text-slate-500">
                                    <div class="font-medium text-slate-700">{{ rec.lastUpdatedDate }}</div>
                                    <div class="text-xs">{{ rec.lastUpdatedBy }}</div>
                                </td>
                            </tr>
                            <tr v-if="filteredRecords.length === 0">
                                <td colspan="5" class="p-8 text-center text-slate-400">Nenašly se žádné záznamy.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Boční panel -->
        <div class="w-96 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.02)] z-20">
            <div class="p-5 border-b border-slate-200 bg-slate-50">
                <h2 class="font-bold text-slate-800 flex items-center gap-2">
                    <i class="ph-fill ph-clock-counter-clockwise text-blue-500"></i> Nedávná aktivita
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

        <!-- MODAL: Správa firem -->
        <div v-if="isCompanyManagerOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden">
                <div class="bg-blue-600 px-6 py-4 flex justify-between items-center shrink-0">
                    <h3 class="text-xl font-bold text-white flex items-center gap-2"><i class="ph-fill ph-buildings"></i> Správa firem</h3>
                    <button @click="isCompanyManagerOpen = false" class="text-blue-200 hover:text-white transition"><i class="ph-bold ph-x text-xl"></i></button>
                </div>
                <div class="p-6 flex-1 overflow-y-auto">
                    <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                        <h4 class="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">{{ editingCompanyInManager.id ? 'Upravit firmu' : 'Přidat novou firmu' }}</h4>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="col-span-2">
                                <input v-model="editingCompanyInManager.name" placeholder="Název firmy *" class="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <input v-model="editingCompanyInManager.web" placeholder="Web" class="border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500">
                            <div class="flex gap-2">
                                <input v-model="editingCompanyInManager.city" placeholder="Město" class="flex-1 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500">
                                <input v-model="editingCompanyInManager.state" placeholder="Stát" class="w-20 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        <div class="flex gap-2 mt-3 justify-end">
                            <button v-if="editingCompanyInManager.id" @click="cancelEditCompany" class="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm">Zrušit</button>
                            <button @click="saveCompanyInManager" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition">
                                <i class="ph-bold ph-floppy-disk"></i> {{ editingCompanyInManager.id ? 'Uložit změny' : 'Přidat firmu' }}
                            </button>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div v-for="co in companiesList" :key="co.id" class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition">
                            <div>
                                <div class="font-medium text-slate-800">{{ co.name }}</div>
                                <div class="text-xs text-slate-400 mt-0.5">{{ co.city }}, {{ co.state }}{{ co.web ? ' — ' + co.web : '' }}</div>
                            </div>
                            <div class="flex gap-1 shrink-0 ml-4">
                                <button @click="startEditCompany(co)" class="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50 transition"><i class="ph-bold ph-pencil"></i></button>
                                <button @click="deleteCompanyFromList(co)" class="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition"><i class="ph-bold ph-trash"></i></button>
                            </div>
                        </div>
                        <div v-if="companiesList.length === 0" class="text-center text-slate-400 py-6 text-sm">Žádné firmy v databázi.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL: Výběr obchodního případu -->
        <div v-if="isOpportunitySelectorOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div class="bg-blue-600 px-6 py-4">
                    <h3 class="text-xl font-bold text-white">Výběr obchodního případu</h3>
                    <p class="text-blue-100 text-sm mt-1">{{ getCompanyName(activeRecord.companyId) }} má více otevřených případů.</p>
                </div>
                <div class="p-6 space-y-3">
                    <button v-for="opp in activeRecord.opportunities" :key="opp.id" @click="selectOpportunityAndOpenModal(opp)" class="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition flex justify-between items-center group">
                        <div>
                            <div class="font-bold text-slate-800 group-hover:text-blue-700">{{ opp.name }}</div>
                            <div class="text-xs text-slate-500 mt-1">Stav: {{ opp.status }}</div>
                        </div>
                        <i class="ph-bold ph-caret-right text-slate-400 group-hover:text-blue-500"></i>
                    </button>
                    <button @click="selectOpportunityAndOpenModal(null)" class="w-full text-left p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-500 text-slate-600 transition flex items-center gap-2 mt-2">
                        <i class="ph-bold ph-plus"></i> Vytvořit nový obchodní případ
                    </button>
                </div>
                <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right">
                    <button @click="isOpportunitySelectorOpen = false" class="text-slate-600 hover:text-slate-800 font-medium">Zrušit</button>
                </div>
            </div>
        </div>

        <!-- MODAL: Detail / Editace záznamu -->
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col">

                <div class="bg-slate-50 border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0 rounded-t-2xl">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            {{ isEditing ? getCompanyName(activeRecord.companyId) : 'Nový záznam' }}
                            <span v-if="selectedOpportunity" class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-semibold border border-blue-200">Případ: {{ selectedOpportunity.name }}</span>
                        </h2>
                        <div v-if="isEditing && activeRecord.origin" class="text-sm text-slate-500 mt-1">
                            Původ: <strong class="text-slate-700">{{ activeRecord.origin }}</strong>
                        </div>
                    </div>
                    <button @click="closeModal" class="text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-full p-2 transition shadow-sm border border-slate-200 w-10 h-10 flex items-center justify-center">
                        <i class="ph-bold ph-x"></i>
                    </button>
                </div>

                <div class="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto grow bg-white">

                    <!-- BLOK 1: Firemní údaje -->
                    <div class="col-span-4 space-y-4">
                        <div class="flex justify-between items-center border-b border-slate-200 pb-2">
                            <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <i class="ph-fill ph-buildings text-slate-400"></i> Firemní údaje
                            </h3>
                            <div class="flex gap-1">
                                <button @click="blockEdit.info = !blockEdit.info" :class="blockEdit.info ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-transparent'" class="p-1.5 rounded-lg border transition text-sm" :title="blockEdit.info ? 'Dokončit úpravy' : 'Upravit'">
                                    <i :class="blockEdit.info ? 'ph-bold ph-check' : 'ph-bold ph-pencil'"></i>
                                </button>
                                <button v-if="isEditing" @click="deleteRecord" class="p-1.5 rounded-lg border border-transparent text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition text-sm" title="Smazat celý záznam">
                                    <i class="ph-bold ph-trash"></i>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Firma <span class="text-red-500">*</span></label>
                            <div v-if="!blockEdit.info" class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800">{{ getCompanyName(activeRecord.companyId) || '—' }}</div>
                            <div v-else class="relative">
                                <input v-model="companySearch" @focus="companyDropdownOpen = true" @blur="delayCloseDropdown" type="text" placeholder="Vyhledat nebo vybrat firmu..." class="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <div v-if="companyDropdownOpen" class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                                    <button v-for="co in filteredCompanySearch" :key="co.id" @mousedown.prevent="pickCompany(co)" class="w-full text-left px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 text-sm border-b border-slate-100 last:border-0 transition">
                                        <span class="font-medium">{{ co.name }}</span>
                                        <span class="text-slate-400 text-xs ml-1">— {{ co.city }}, {{ co.state }}</span>
                                    </button>
                                    <div v-if="filteredCompanySearch.length === 0" class="px-4 py-3 text-slate-400 text-sm">Žádné firmy nenalezeny.</div>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Stav spolupráce</label>
                                <div v-if="!blockEdit.info" class="mt-1">
                                    <span class="text-xs font-bold px-2 py-1 rounded border" :class="getStatusColor(activeRecord.status)">{{ activeRecord.status }}</span>
                                </div>
                                <select v-else v-model="activeRecord.status" class="w-full border border-slate-300 rounded-lg p-2.5 font-semibold bg-slate-50">
                                    <option>MOŽNÁ</option><option>V JEDNÁNÍ</option><option>ZÁKAZNÍK</option><option>ZAMÍTNUTO</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Markery</label>
                                <div v-if="!blockEdit.info" class="flex flex-wrap gap-1 mt-1">
                                    <span v-if="!activeRecord.markers.length" class="text-slate-400 text-sm">—</span>
                                    <span v-for="m in activeRecord.markers" :key="m" class="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">{{ m }}</span>
                                </div>
                                <div v-else class="flex flex-col gap-1 mt-1">
                                    <label class="flex items-center gap-2 text-sm"><input type="checkbox" value="Prozkoumat" v-model="activeRecord.markers" class="rounded text-purple-600"> Prozkoumat</label>
                                    <label class="flex items-center gap-2 text-sm"><input type="checkbox" value="V jednání" v-model="activeRecord.markers" class="rounded text-purple-600"> V jednání</label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Původ kontaktu</label>
                            <div v-if="!blockEdit.info" class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">{{ activeRecord.origin || '—' }}</div>
                            <input v-else v-model="activeRecord.origin" type="text" placeholder="Např. Veletrh InnoTrans" class="w-full border border-slate-300 rounded-lg p-2.5">
                        </div>

                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Obchodní statistiky (Z ERP)</h4>
                            <div class="grid grid-cols-3 gap-2">
                                <div class="bg-white p-2 rounded border border-slate-100 text-center shadow-sm">
                                    <div class="text-[10px] text-slate-400 uppercase font-bold">Obrat</div>
                                    <div class="font-bold text-slate-800">{{ activeRecord.turnover || '0' }}</div>
                                </div>
                                <div class="bg-white p-2 rounded border border-slate-100 text-center shadow-sm">
                                    <div class="text-[10px] text-slate-400 uppercase font-bold">Objednávky</div>
                                    <div class="font-bold text-slate-800">{{ activeRecord.ordersCount || 0 }}</div>
                                </div>
                                <div class="bg-white p-2 rounded border border-slate-100 text-center shadow-sm">
                                    <div class="text-[10px] text-slate-400 uppercase font-bold">Poptávky</div>
                                    <div class="font-bold text-slate-800">{{ activeRecord.inquiriesCount || 0 }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- BLOK 2: Kontaktní osoby -->
                    <div class="col-span-4 space-y-4">
                        <div class="flex justify-between items-center border-b border-slate-200 pb-2">
                            <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <i class="ph-fill ph-users text-slate-400"></i> Kontaktní osoby
                            </h3>
                            <button @click="blockEdit.contacts = !blockEdit.contacts" :class="blockEdit.contacts ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 border-transparent'" class="p-1.5 rounded-lg border transition text-sm" :title="blockEdit.contacts ? 'Dokončit úpravy' : 'Upravit'">
                                <i :class="blockEdit.contacts ? 'ph-bold ph-check' : 'ph-bold ph-pencil'"></i>
                            </button>
                        </div>
                        <div class="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            <div v-if="!activeRecord.contacts.length" class="text-slate-400 text-sm text-center py-6">Žádné kontakty.</div>
                            <div v-for="(contact, index) in activeRecord.contacts" :key="index" class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <!-- Readonly -->
                                <div v-if="!blockEdit.contacts">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <div class="font-semibold text-slate-800">{{ contact.name || '—' }}</div>
                                            <div class="text-xs text-slate-500 mt-0.5">{{ contact.role }}</div>
                                        </div>
                                        <div class="flex gap-1 ml-2 shrink-0">
                                            <button @click="blockEdit.contacts = true" class="text-slate-300 hover:text-blue-500 p-1 rounded hover:bg-blue-50 transition" title="Upravit kontakt"><i class="ph-bold ph-pencil text-xs"></i></button>
                                            <button @click="removeContact(index)" class="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition" title="Smazat kontakt"><i class="ph-bold ph-trash text-xs"></i></button>
                                        </div>
                                    </div>
                                    <div class="mt-2 space-y-1">
                                        <div v-if="contact.phone" class="flex items-center gap-2 text-sm text-slate-600"><i class="ph-fill ph-phone text-slate-400 text-xs"></i> {{ contact.phone }}</div>
                                        <div v-if="contact.email" class="flex items-center gap-2 text-sm text-slate-600"><i class="ph-fill ph-envelope-simple text-slate-400 text-xs"></i> {{ contact.email }}</div>
                                    </div>
                                </div>
                                <!-- Editable -->
                                <div v-else class="relative">
                                    <button @click="removeContact(index)" class="absolute top-0 right-0 text-slate-300 hover:text-red-500 p-1 rounded transition" title="Smazat"><i class="ph-bold ph-trash text-sm"></i></button>
                                    <input v-model="contact.name" placeholder="Jméno a příjmení" class="w-full mb-2 p-2 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none bg-slate-50 rounded font-semibold text-slate-800 transition">
                                    <input v-model="contact.role" placeholder="Pozice / Oddělení" class="w-full mb-3 p-2 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none bg-slate-50 rounded text-sm transition">
                                    <div class="flex flex-col gap-2">
                                        <div class="flex items-center gap-2"><i class="ph-fill ph-phone text-slate-400"></i><input v-model="contact.phone" placeholder="Telefon" class="w-full p-1.5 border border-slate-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></div>
                                        <div class="flex items-center gap-2"><i class="ph-fill ph-envelope-simple text-slate-400"></i><input v-model="contact.email" placeholder="E-mail" type="email" class="w-full p-1.5 border border-slate-200 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button @click="addContact" class="w-full py-2.5 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-2 font-medium">
                            <i class="ph-bold ph-plus"></i> Přidat kontaktní osobu
                        </button>
                    </div>

                    <!-- BLOK 3: Záznamy z jednání -->
                    <div class="col-span-4 space-y-4 flex flex-col h-full">
                        <div class="flex justify-between items-end border-b border-slate-200 pb-2">
                            <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <i class="ph-fill ph-chat-circle-text text-slate-400"></i> Záznamy z jednání
                            </h3>
                            <span class="text-xs text-slate-500 font-medium">Případ: {{ selectedOpportunity ? selectedOpportunity.name : 'Všeobecné' }}</span>
                        </div>
                        <div class="flex-grow overflow-y-auto space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[300px] shadow-inner custom-scrollbar">
                            <div v-if="filteredHistory.length === 0" class="text-slate-400 text-center py-8 text-sm flex flex-col items-center gap-2">
                                <i class="ph-fill ph-folder-open text-3xl opacity-50"></i>
                                Pro tento případ nejsou žádné záznamy.
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
                        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                            <textarea v-model="newCommentText" placeholder="Zadejte poznámku, výsledek hovoru nebo posun v obchodu..." class="w-full border-slate-300 rounded-lg shadow-sm p-3 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none" rows="3"></textarea>
                            <div class="flex justify-between items-center mt-3">
                                <div class="flex items-center gap-2 text-sm text-slate-500">
                                    <span>Autor:</span>
                                    <select v-model="newCommentAuthor" class="border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 font-semibold focus:outline-none focus:border-blue-500 text-sm bg-white">
                                        <option v-for="u in users" :key="u.id" :value="u.name">{{ u.name }}</option>
                                    </select>
                                </div>
                                <button @click="addComment" :disabled="!newCommentText" class="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg shadow-sm text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    <i class="ph-bold ph-paper-plane-right"></i> Odeslat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-50 border-t border-slate-200 px-8 py-4 flex justify-end gap-3 items-center shrink-0 rounded-b-2xl">
                    <button @click="closeModal" class="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition shadow-sm">Zrušit</button>
                    <button @click="saveRecord" class="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md font-bold transition flex items-center gap-2">
                        <i class="ph-bold ph-floppy-disk"></i> {{ isEditing ? 'Uložit všechny změny' : 'Vytvořit záznam' }}
                    </button>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, computed } from 'vue';

// --- DÁTA ---

const newCommentText = ref('');
const newCommentAuthor = ref('');

const users = ref([
    { id: 1, name: 'Admin', username: 'admin', password: 'admin', role: 'admin' },
    { id: 2, name: 'Španěl R.', username: 'spanel', password: 'spanel', role: 'user' },
    { id: 3, name: 'PH', username: 'ph', password: 'ph', role: 'user' },
]);

const companiesList = ref([
    { id: 1, name: 'REGONIK s.r.o.', web: 'http://www.regonik.sk', city: 'Bratislava', state: 'SK' },
    { id: 2, name: 'SITEL', web: 'https://www.sitel.si', city: 'Maribor', state: 'SI' },
]);

const records = ref([
    {
        id: 1, companyId: 1, origin: 'Veletrh', turnover: '100mil Kč', ordersCount: 2, inquiriesCount: 5,
        status: 'MOŽNÁ', markers: ['Prozkoumat'], lastUpdatedDate: '04.05.2026', lastUpdatedBy: 'Španěl R.',
        opportunities: [
            { id: 101, name: 'Projekt ČD WiFi 2025', status: 'Otevřeno' },
            { id: 102, name: 'Dodávka switchů Lantech', status: 'V realizaci' }
        ],
        contacts: [{ name: 'Martin Hruškovič', role: 'Executive Director', phone: '+421914700593', email: 'martin.hruskovic@regonik.sk' }],
        history: [
            { oppId: 101, date: '04.05.2026', author: 'Španěl R.', text: 'Krátký telefonát s dotazem na projekty. Aktuálně nevidí projekt.' },
            { oppId: 102, date: '12.11.2024', author: 'Španěl R.', text: 'Pan Hruškovič se rozhodl jít s konkurenčním řešením.' }
        ]
    },
    {
        id: 2, companyId: 2, origin: 'Doporučení', turnover: '-', ordersCount: 0, inquiriesCount: 1,
        status: 'ZÁKAZNÍK', markers: ['V jednání'], lastUpdatedDate: '30.07.2024', lastUpdatedBy: 'PH',
        opportunities: [{ id: 201, name: 'Všeobecná spolupráce', status: 'Otevřeno' }],
        contacts: [{ name: 'Janez Novak', role: 'Manager', phone: '+386 40 123 456', email: 'janez@sitel.si' }],
        history: [{ oppId: 201, date: '30.07.2024', author: 'PH', text: 'Založení záznamu a první kontakt.' }]
    }
]);

// --- AUTENTIZACE ---

const isLoggedIn = ref(false);
const currentUser = ref(null);
const loginUsername = ref('');
const loginPassword = ref('');
const loginError = ref(false);
const currentView = ref('crm');

const login = () => {
    const user = users.value.find(u => u.username === loginUsername.value && u.password === loginPassword.value);
    if (user) {
        isLoggedIn.value = true;
        currentUser.value = user;
        loginError.value = false;
        newCommentAuthor.value = user.name;
    } else {
        loginError.value = true;
    }
};

const logout = () => {
    isLoggedIn.value = false;
    currentUser.value = null;
    loginUsername.value = '';
    loginPassword.value = '';
    currentView.value = 'crm';
};

// --- HELPERS: FIRMY ---

const getCompanyName = (id) => companiesList.value.find(c => c.id === id)?.name || '—';
const getCompanyWeb = (id) => companiesList.value.find(c => c.id === id)?.web || '';
const getCompanyLocation = (id) => {
    const c = companiesList.value.find(c => c.id === id);
    return c ? `${c.city}, ${c.state}` : '—';
};

// --- SPRÁVA FIREM (modal) ---

const isCompanyManagerOpen = ref(false);
const editingCompanyInManager = ref({ id: null, name: '', web: '', city: '', state: '' });

const openCompanyManager = () => {
    cancelEditCompany();
    isCompanyManagerOpen.value = true;
};

const startEditCompany = (co) => { editingCompanyInManager.value = { ...co }; };
const cancelEditCompany = () => { editingCompanyInManager.value = { id: null, name: '', web: '', city: '', state: '' }; };

const saveCompanyInManager = () => {
    if (!editingCompanyInManager.value.name.trim()) return;
    if (editingCompanyInManager.value.id) {
        const idx = companiesList.value.findIndex(c => c.id === editingCompanyInManager.value.id);
        companiesList.value[idx] = { ...editingCompanyInManager.value };
    } else {
        companiesList.value.push({ ...editingCompanyInManager.value, id: Date.now() });
    }
    cancelEditCompany();
};

const deleteCompanyFromList = (co) => {
    if (confirm(`Smazat firmu ${co.name}?`)) {
        companiesList.value = companiesList.value.filter(c => c.id !== co.id);
    }
};

// --- VYHLEDÁVÁNÍ ---

const searchQuery = ref('');

const filteredRecords = computed(() => {
    if (!searchQuery.value) return records.value;
    const q = searchQuery.value.toLowerCase();
    return records.value.filter(r => getCompanyName(r.companyId).toLowerCase().includes(q) || JSON.stringify(r).toLowerCase().includes(q));
});

const globalHistory = computed(() => {
    const all = [];
    records.value.forEach(rec => rec.history.forEach(log => all.push({ ...log, companyName: getCompanyName(rec.companyId) })));
    return all.reverse().slice(0, 10);
});

// --- MODAL ZÁZNAMU ---

const isModalOpen = ref(false);
const isOpportunitySelectorOpen = ref(false);
const isEditing = ref(false);
const activeRecord = ref(null);
const selectedOpportunity = ref(null);
const blockEdit = ref({ info: false, contacts: false });

const companySearch = ref('');
const companyDropdownOpen = ref(false);

const filteredCompanySearch = computed(() => {
    if (!companySearch.value) return companiesList.value;
    const q = companySearch.value.toLowerCase();
    return companiesList.value.filter(c => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
});

const pickCompany = (co) => {
    activeRecord.value.companyId = co.id;
    companySearch.value = co.name;
    companyDropdownOpen.value = false;
};

const delayCloseDropdown = () => setTimeout(() => { companyDropdownOpen.value = false; }, 150);

const filteredHistory = computed(() => {
    if (!activeRecord.value) return [];
    if (!selectedOpportunity.value) return activeRecord.value.history;
    return activeRecord.value.history.filter(h => h.oppId === selectedOpportunity.value.id || !h.oppId);
});

const getStatusColor = (status) => {
    const map = {
        'MOŽNÁ': 'bg-blue-100 text-blue-700 border-blue-200',
        'V JEDNÁNÍ': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'ZÁKAZNÍK': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'ZAMÍTNUTO': 'bg-red-100 text-red-700 border-red-200',
    };
    return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
};

const handleRecordClick = (rec) => {
    activeRecord.value = JSON.parse(JSON.stringify(rec));
    isEditing.value = true;
    blockEdit.value = { info: false, contacts: false };
    if (activeRecord.value.opportunities.length > 1) {
        isOpportunitySelectorOpen.value = true;
    } else {
        selectedOpportunity.value = activeRecord.value.opportunities[0] || null;
        isModalOpen.value = true;
    }
};

const selectOpportunityAndOpenModal = (opp) => {
    if (opp === null) {
        const newOpp = { id: Date.now(), name: 'Nový případ ' + (activeRecord.value.opportunities.length + 1), status: 'Otevřeno' };
        activeRecord.value.opportunities.push(newOpp);
        selectedOpportunity.value = newOpp;
    } else {
        selectedOpportunity.value = opp;
    }
    isOpportunitySelectorOpen.value = false;
    isModalOpen.value = true;
};

const openRecordModal = () => {
    isEditing.value = false;
    activeRecord.value = {
        id: null, companyId: null, origin: '', turnover: '', ordersCount: 0, inquiriesCount: 0,
        status: 'MOŽNÁ', markers: [],
        opportunities: [{ id: Date.now(), name: 'Nový obchodní případ', status: 'Otevřeno' }],
        contacts: [], history: [], lastUpdatedDate: '', lastUpdatedBy: ''
    };
    selectedOpportunity.value = activeRecord.value.opportunities[0];
    blockEdit.value = { info: true, contacts: true };
    companySearch.value = '';
    newCommentText.value = '';
    isModalOpen.value = true;
};

const closeModal = () => {
    isModalOpen.value = false;
    isOpportunitySelectorOpen.value = false;
    activeRecord.value = null;
    selectedOpportunity.value = null;
    companySearch.value = '';
};

const addContact = () => {
    activeRecord.value.contacts.push({ name: '', role: '', phone: '', email: '' });
    blockEdit.value.contacts = true;
};

const removeContact = (index) => {
    if (confirm('Smazat tento kontakt?')) activeRecord.value.contacts.splice(index, 1);
};

const addComment = () => {
    if (!newCommentText.value.trim()) return;
    const d = new Date();
    const dateStr = `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}.${d.getFullYear()}`;
    activeRecord.value.history.unshift({
        oppId: selectedOpportunity.value?.id || null,
        date: dateStr,
        author: newCommentAuthor.value || 'Neznámý',
        text: newCommentText.value
    });
    activeRecord.value.lastUpdatedDate = dateStr;
    activeRecord.value.lastUpdatedBy = newCommentAuthor.value;
    newCommentText.value = '';
};

const saveRecord = () => {
    if (!activeRecord.value.companyId) { alert('Vyberte prosím firmu.'); return; }
    if (isEditing.value) {
        const idx = records.value.findIndex(r => r.id === activeRecord.value.id);
        records.value[idx] = activeRecord.value;
    } else {
        activeRecord.value.id = Date.now();
        records.value.push(activeRecord.value);
    }
    closeModal();
};

const deleteRecord = () => {
    if (confirm(`Smazat záznam ${getCompanyName(activeRecord.value.companyId)}?`)) {
        records.value = records.value.filter(r => r.id !== activeRecord.value.id);
        closeModal();
    }
};

// --- ADMIN: UŽIVATELÉ ---

const adminTab = ref('users');
const isUserFormOpen = ref(false);
const editingUser = ref({});

const openUserForm = (user) => {
    editingUser.value = user ? { ...user } : { id: null, name: '', username: '', password: '', role: 'user' };
    isUserFormOpen.value = true;
};

const saveUser = () => {
    if (!editingUser.value.name || !editingUser.value.username) return;
    if (editingUser.value.id) {
        const idx = users.value.findIndex(u => u.id === editingUser.value.id);
        users.value[idx] = { ...editingUser.value };
        if (currentUser.value?.id === editingUser.value.id) currentUser.value = { ...editingUser.value };
    } else {
        users.value.push({ ...editingUser.value, id: Date.now() });
    }
    isUserFormOpen.value = false;
};

const deleteUser = (user) => {
    if (user.id === currentUser.value?.id) { alert('Nemůžete smazat vlastní účet.'); return; }
    if (confirm(`Smazat uživatele ${user.name}?`)) users.value = users.value.filter(u => u.id !== user.id);
};
</script>

<style>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>
