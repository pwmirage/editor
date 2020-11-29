<script id="pw-preview-root" type="text/x-jstemplate">
<div id="container">
	<div id="menu">
		{for i = 0; i < $preview.tabs.length; i++}
			{assign tab = $preview.tabs[$i]}
			<div onclick="{serialize $preview}.select_tab('{@$i}');">
				{assign tabnames = \{
					npcs: 'NPC',
					npc_spawns: 'Spawner',
					npc_recipes: 'NPC Recipes',
					npc_sells: 'NPC Goods',
					recipes: 'Recipes',
					items: 'Items',
				\}}
				<p>{@$i + 1}. {@$tabnames[$tab.type] || $tab.type}</p>
			</div>
		{/for}
		{if $preview.tabs.length == 0}
			<div class="disabled"><p>No changes</p></div>
		{/if}
	</div>
	<div id="element">
	</div>
</div>

{@@
<style>
:host {
	display: block;
	position: static;
	height: 280px;
}

#container {
	position: absolute;
	display: flex;
}

#menu {
	overflow-y: auto;
	overflow-x: hidden;
	border: 1px solid #b47a63;
	height: fit-content;
}

#menu div > p {
	display: inline-block;
	padding: 8px;
	margin: 0;
	width: 100px;
	background-color: var(--color-button-bg);
	color: var(--color-button-fg);
	cursor: pointer;
	font-size: 12px;
	font-weight: bold;
}

#menu div.selected > p {
	background-color: var(--color-button-bg-darker);
}

#menu div.disabled > p {
	background-color: #d4d4d4;
	color: #908484;
	text-align: center;
}

#menu div.more {
	position: absolute;
	z-index: 2;
	border: 1px solid #b47a63;
	margin-left: -1px;
}

#menu div.more > div {
	max-height: 0;
	transition: max-height 0.2s ease-in-out;
}

#menu div.more.expanded > div {
	max-height: 30px;
}
</style>
@@}
</script>
