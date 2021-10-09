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

            <div style="align-items: unset;">
                {if $obj.award?.item_groups?.length > 1}
                    {assign award_item_type = 2}
                {else if $obj.award?.item_groups?.[0]?.chosen_randomly}
                    {assign award_item_type = 1}
                {else}
                    {assign award_item_type = 0}
                {/if}
                <span>Items: </span>
                {if $award_item_type == 2}
                    <span>Choose one of the below:</span>
                {else if $award_item_type == 1}
                    <span>Receive one random item:</span>
                {else}
                    <span>Receive all of the below:</span>
                {/if}
                <div id="award_items" style="margin-top: 5px; display: flex; flex-wrap: wrap; row-gap: 10px;">
                    {if $award_item_type == 0 || $award_item_type == 1}
                        <div style="display: flex; flex-direction: column; row-gap: 5px; padding-right: 4px;">
                                <span>Num:</span>
                                <span>%:</span>
                        </div>

                        {assign idx = -1}
                        {for item of ($obj.award?.item_groups?.[0]?.items || [])}
                            {$idx++}
                            {if !$item?.id}{continue}{/if}
                            <div class="item-w-cnt" style="display: flex;">
                                <span class="item" data-preview data-link-item="{serialize $obj} => 'award', 'item_groups', 0, 'items', {@$idx}, 'id'" data-default-id="-1" tabindex="0"></span>
                                <div style="display: flex; flex-direction: column; row-gap: 5px; padding: 0 4px;">
                                    <span data-input class="input-number" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $obj} => 'award', 'item_groups', 0, 'items', '{@$idx}', 'amount'" data-placeholder="(0)"></span>
                                    <span data-input class="input-number is_float" style="width: 28px; font-size: 12px; padding: 3px;" data-link="{serialize $obj} => 'award', 'item_groups', 0, 'items', '{@$idx}', 'probability'" data-placeholder="(0)"></span>
                                </div>
                            </div>
                        {/for}

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
	font-size: 0;
	line-height: 0;
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