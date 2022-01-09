<script id="tpl-preview-npc-tasks" type="text/x-dot-template">
<div class="window" style="width: 468px;">
<div class="header {if $obj._removed}removed{/if}">
	<span>
		Task: {@($obj?.name || '').replace(/\^[0-9a-fA-F]\{6\}/g, '')} {@DB.serialize_id($obj.id)}
	</span>
</div>
<div class="content flex-rows">
<div></div>
    {if $view == 'awards'}
        <div style="font-weight: bold;">Awards:</div>
        <div class="flex-columns" style="flex-wrap: wrap; align-items: baseline;">
            {hascontent}<div class="flex-columns">
                <span>XP:</span>
                <span>{content}{@$obj?.award?.xp || ''}{/content}</span>
            </div>{/hascontent}
            {hascontent}<div class="flex-columns">
                <span>SP:</span>
                <span>{content}{@$obj?.award?.sp || ''}{/content}</span>
            </div>{/hascontent}
            {hascontent}<div class="flex-columns">
                <span>Rep:</span>
                <span>{content}{@$obj?.award?.rep || ''}{/content}</span>
            </div>{/hascontent}
            <!--<div class="flex-columns">
                <span>New quest:</span>
                <a class="button menu-triangle" data-link-button="{serialize $obj} => 'award', 'new_quest'" data-select="db.tasks"></a>
            </div>-->
            <!--<div class="flex-columns">
                <span>Trigger:</span>
                <a class="button menu-triangle" data-link-button="{serialize $obj} => 'award', 'ai_trigger'" data-select="db['triggers_' + (g_map.maptype.id != 'none' ? g_map.maptype.id : 'gs01')]" style="margin-top: 1px; margin-bottom: 1px;"></a>
                <label title="Checked = enable trigger" style="margin-left: -5px; align-items: baseline;"><input type="checkbox" data-link="{serialize $obj} => 'award', 'ai_trigger_enable'" class="checkbox" disabled><span></span></label>
            </div>-->
            {hascontent}<div class="flex-columns">
                <span>Coins:</span>
                <span>{content}{@$obj?.award?.coins || ''}{/content}</span>
            </div>{/hascontent}

            <div style="align-items: unset; width: 100%;">
                {if $obj.award?.item_groups?.length > 1}
                    {assign award_item_type = 2}
                {else if $obj.award?.item_groups?.[0]?.chosen_randomly}
                    {assign award_item_type = 1}
                {else}
                    {assign award_item_type = 0}
                {/if}
                {if $award_item_type == 2}
                    <span>Items: choose one row from the below:</span>
                {else if $award_item_type == 1}
                    <span>Receive items:</span>
                {else}
                    <span>Receive items:</span>
                {/if}
                <div>
                    {if $award_item_type == 0 || $award_item_type == 1}
                        {assign idx = -1}
                        {assign items = $obj.award?.item_groups?.[0]?.items?.filter(i => i.id) || []}
                        {assign p100_items = $items.filter(i => i.probability == 1)}
                        {assign p_items = $items.filter(i => i.probability && i.probability != 1)}
                        <div class="award_items">
                            {for item of $p100_items}
                                {$idx++}
                                <div class="item-w-cnt">
                                    <span>{@$item.amount}x</span>
                                    <span class="item" data-id="{@$item.id}" data-prev="-1" data-idx="{@$i}"><img{ } src="{@Item.get_icon_by_item($db, $item.id)}" alt=""></span>
                                    {if $idx != $items.length - 1}<span>,</span>{/if}
                                </div>
                            {/for}
                        </div>
                        <div class="award_items" style="{if $award_item_type == 0}flex-direction: column{/if}">
                            {for item of $p_items}
                                {$idx++}
                                <div class="item-w-cnt">
                                    <span>({@($item.probability * 100).toPrecision(7)*1}%)</span>
                                    <span>{@$item.amount}x</span>
                                    <span class="item" data-id="{@$item.id}" data-prev="-1" data-idx="{@$i}"><img{ } src="{@Item.get_icon_by_item($db, $item.id)}" alt=""></span>
                                    {if $idx != $items.length - 1}<span>,</span>{/if}
                                </div>
                            {/for}
                        </div>
                    {else if $award_item_type == 2}
                        {assign group_idx = -1}
                        <div class="award_item_rows">
                            {for group of ($obj.award?.item_groups || [])}
                                <div class="data-field">
                                    {$group_idx++}
                                    <span>{@$group_idx + 1}.</span>
                                    {for idx = 0; idx < 4; idx++}
                                        <span class="item" data-preview data-link-item="{serialize $obj} => 'award', 'item_groups', {@$group_idx}, 'items', {@$idx}, 'id'" data-default-id="0" tabindex="0"></span>
                                    {/for}
                                    <div style="flex: 1;"></div>
                                </div>
                            {/for}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
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

.item-w-cnt {
    display: flex;
    align-items: center;
    font-weight: bold;
    column-gap: 5px;
}

.award_items {
    margin-top: 5px;
    display: flex;
    flex-wrap: wrap;
    row-gap: 10px;
    column-gap: 10px;"
}

.award_item_rows {
	display: flex;
	flex-direction: column;
	row-gap: 3px;
}

.data-field {
	display: flex;
	align-items: center;
	column-gap: 4px;
	row-gap: 4px;
}
</style>
@@}
</script>
