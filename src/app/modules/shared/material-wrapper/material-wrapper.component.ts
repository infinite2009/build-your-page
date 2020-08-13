import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MessageService } from '@/services/message.service';
import { Subscription } from 'rxjs';
import PageSchema from '@/interfaces/schema/page.schema';
import WidgetFamilySchema from '@/types/widget-family-schema';

@Component({
  selector: 'seibertron-material-wrapper',
  templateUrl: './material-wrapper.component.html',
  styleUrls: ['./material-wrapper.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialWrapperComponent implements OnInit {
  constructor(private msgService: MessageService) {}

  @Input()
  widgetSchema: WidgetFamilySchema;

  get selected() {
    return this.selectedSchema && this.selectedSchema.id === this.widgetSchema.id;
  }

  pageSchemaSubscription: Subscription;

  pageSchema: PageSchema;

  selectedMaterialSubscription: Subscription;

  selectedSchema: any;

  ngOnInit(): void {
    this.pageSchemaSubscription = this.msgService.pageSchemaMsg.subscribe((schema: PageSchema) => {
      this.pageSchema = schema;
    });
    this.selectedMaterialSubscription = this.msgService.selectedSchemaMsg.subscribe((data: any) => {
      this.selectedSchema = data;
    });
  }

  /* handlers */
  handleSelectingMaterial() {
    if (this.selectedSchema?.id === this.widgetSchema?.id) {
      this.msgService.unselectWidget();
    } else {
      this.msgService.selectWidget(this.widgetSchema);
    }
  }
}
