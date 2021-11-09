/* SPDX-License-Identifier: MIT
 * Copyright(c) 2021 Darek Stojaczyk for pwmirage.com
 */

class PWDBMeta {
    static task_types = init_id_array([
        { id: 0, name: 'Normal' },
        { id: 1, name: 'Cycle' },
        { id: 2, name: 'Spiritual Cultivation' },
        { id: 3, name: 'Hero' },
        { id: 4, name: 'Challenge' },
        { id: 5, name: 'Adventure' },
        { id: 6, name: 'Errand' },
        { id: 7, name: 'Legendary' },
        { id: 8, name: 'Battle' },
        { id: 9, name: 'Public' },
        { id: 10, name: 'Main Story' },
        { id: 11, name: 'Faction' },
        { id: 12, name: 'Daily' },
        { id: 13, name: 'Event' },
        /* TODO add new types for repeatable quests like teleports, pack opening, etc */
    ]);

    static task_date_span_types = init_id_array([
        { id: 0, name: 'Date' },
        { id: 1, name: 'Month' },
        { id: 2, name: 'Week' },
        { id: 3, name: 'Day' },
    ]);

    static task_avail_frequency_types = init_id_array([
        { id: 0, name: 'Always' },
        { id: 6, name: 'Never' },
        { id: 1, name: 'Once a Day' },
        { id: 2, name: 'Once a Week' },
        { id: 3, name: 'Once a Month' },
        { id: 4, name: 'Once a Minute' },
        { id: 5, name: 'Once an Hour' },
    ]);

    static task_cultivation_levels = init_id_array([
        { id: 0, name: "None" },
        { id: 1, name: "(9) Spiritual Adept" },
        { id: 2, name: "(19) Aware of Principle" },
        { id: 3, name: "(29) Aware of Harmony" },
        { id: 4, name: "(39) Aware of Discord" },
        { id: 5, name: "(49) Aware of Coalescence" },
        { id: 6, name: "(59) Transcendant" },
        { id: 7, name: "(69) Enlightened One" },
        { id: 8, name: "(79) Aware of Vacuity" },
        { id: 20, name: "(89) Aware of Myriad" },
        { id: 30, name: "(89) Aware of the Void" },
        { id: 21, name: "(99) Master of Harmony" },
        { id: 31, name: "(99) Master of Discord" },
        { id: 22, name: "(100) Celestial Sage" },
        { id: 32, name: "(100) Celestial Demon" },
    ]);

    static task_faction_ranks = init_id_array([
        { id: 0, name: "None" },
        { id: 2, name: "Leader" },
        { id: 3, name: "Director" },
        { id: 4, name: "Marshal" },
        { id: 5, name: "Executor" },
        { id: 6, name: "Comissioner" },
    ]);

    static task_genders = init_id_array([
        { id: 0, name: "Any" },
        { id: 1, name: "Male" },
        { id: 2, name: "Female" },
    ]);

    static classes = init_id_array([
        { id: 0, name: "Blademaster" },
        { id: 1, name: "Wizard" },
        { id: 3, name: "Venomancer" },
        { id: 4, name: "Barbarian" },
        { id: 6, name: "Archer" },
        { id: 7, name: "Cleric" },
    ]);
    static task_classes = PWDBMeta.classes;

    static task_tabs_obtain_ways = init_id_array([
        { id: 0, name: "By parent" },
        { id: 1, name: "Auto" },
        { id: 2, name: "Talk to NPC" },
        { id: 3, name: "Reach Location" },
        { id: 4, name: "By Death" },
    ]);

    static task_tabs_goals = init_id_array([
        { id: 3, name: "None" },
        { id: 5, name: "Wait" },
        { id: 2, name: "Obtain Regular Items" },
        { id: 1, name: "Kill Monsters" },
        { id: 4, name: "Reach Location" },
    ]);

    static task_tabs_sub_quest_activation = init_id_array([
        { id: 0, name: "All at once" },
        { id: 1, name: "As specified" },
        { id: 2, name: "A random one" },
        { id: 3, name: "One by one, first to last" },
    ]);

    static task_dialogue_choice_opts = init_id_array([
        { id: 0x80000000, "name": "Exit talk" },
        { id: 0x80000001, "name": "NPC_SELL" },
        { id: 0x80000002, "name": "NPC_BUY" },
        { id: 0x80000003, "name": "NPC_REPAIR" },
        { id: 0x80000004, "name": "NPC_INSTALL" },
        { id: 0x80000005, "name": "NPC_UNINSTALL" },
        { id: 0x80000006, "name": "Start quest", param: true },
        { id: 0x80000007, "name": "Finish quest", param: true },
        /* { id: 0x80000008, "name": "NPC_GIVE_TASK_MATTER" }, unused */
        { id: 0x80000009, "name": "NPC_SKILL" },
        { id: 0x8000000a, "name": "NPC_HEAL" },
        { id: 0x8000000b, "name": "NPC_TRANSMIT" },
        { id: 0x8000000c, "name": "NPC_TRANSPORT" },
        { id: 0x8000000d, "name": "NPC_PROXY" },
        { id: 0x8000000e, "name": "NPC_STORAGE" },
        { id: 0x8000000f, "name": "NPC_MAKE" },
        { id: 0x80000010, "name": "NPC_DECOMPOSE" },
        { id: 0x80000011, "name": "Prev. dialogue" },
        { id: 0x80000012, "name": "Exit talk" },
        { id: 0x80000013, "name": "NPC_STORAGE_PASSWORD" },
        { id: 0x80000014, "name": "NPC_IDENTIFY" },
        { id: 0x80000015, "name": "Give up quest", param: true },
        { id: 0x80000016, "name": "NPC_WAR_TOWERBUILD" },
        { id: 0x80000017, "name": "NPC_RESETPROP" },
        { id: 0x80000018, "name": "NPC_PETNAME" },
        { id: 0x80000019, "name": "NPC_PETLEARNSKILL" },
        { id: 0x8000001a, "name": "NPC_PETFORGETSKILL" },
        { id: 0x8000001b, "name": "NPC_EQUIPBIND" },
        { id: 0x8000001c, "name": "NPC_EQUIPDESTROY" },
        { id: 0x8000001d, "name": "NPC_EQUIPUNDESTROY" },
    ]);

    static task_award_types = init_id_array([
        { id: 0, name: "Normal" },
        { id: 1, name: "Dep. on mob/item count" },
        { id: 2, name: "Dep. on time spent" },
    ]);

    static task_award_item_types = init_id_array([
        { id: 0, name: "Fixed Items" },
        { id: 1, name: "One Random Item" },
        { id: 2, name: "Chooser" },
    ]);
};
