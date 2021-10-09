<script id="tpl-preview-npc-crafts" type="text/x-dot-template">
<div class="window" style="width: 316px;">
<div class="header {if $obj._removed}removed{/if}">
	<span>
		Crafts: {@$obj.name || ""} {@DB.serialize_id($obj.id)}
	</span>
</div>
<div class="content flex-rows">
	<div id="tabs" class="flex-columns" style="flex-wrap: wrap; margin-bottom: 5px;">
	{for i = 0; i < 8; i++}
	    {if !$obj?.pages?.[$i]?.title}{continue}{/if}
		<a class="button {if $page.selected_tab == $i}active{/if}" onclick="{serialize $page}.select_tab({@$i});"><span data-input data-preview data-link="{serialize $obj} => 'pages', {@$i}, 'title'" data-placeholder="(none)"></span></a>
	{/for}
	</div>
	<div id="items" class="flex-columns" style="flex-wrap: wrap;">
		{assign tab = $obj.pages[$page.selected_tab || 0]}
		{for i = 0; i < 32; i++}
			{assign id = $tab?.recipe_id[i] || 0}
			<span class="recipe" data-id="{@$id}" data-prev="-1" data-idx="{@$i}"><img{ } src="{@ROOT_URL + 'recipe/' + $id + '/icon'}" alt=""></span>
		{/for}
	</div>
</div>

{@@
<style>
.window {
    position: initial;
    text-align: left;
}

.window > .header {
    cursor: default;
}

#tabs {
	margin-top: 0px;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	column-gap: 6px;
	row-gap: 6px;
}

#tabs > * > span {
    text-transform: uppercase;
    color: rgb(33, 33, 33) !important;
}

#tabs > *.active > span {
    color: #efefef !important;
}

#items {
	background-color: #000;
	gap: 4px;
	padding: 4px;
	padding-right: 3px;
}

#items > * {
	width: 32px;
	height: 32px;
	position: relative;
	cursor: pointer;
}

#items > .recipe,
#items > .recipe > img {
	outline: none;
}

#items > .recipe:hover {
	box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.75);
	border: 1px solid var(--header-color);
	margin: -1px;
}

</style>
@@}
</script>