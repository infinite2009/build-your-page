import CommandType from '@/enum/command-type';
import WidgetType from '@/enum/schema/widget-type.enum';
import ICommandPayload from '@/interfaces/command-payload';
import DataSourceSchema from '@/interfaces/schema/data-source.schema';
import FormItem from '@/models/form/form-item';
import StyleFormItem from '@/models/form/style-form-item';
import { BasicFormService } from '@/services/forms/basic-form.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzCascaderOption, NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'seibertron-insert-command',
  templateUrl: './insert-command.component.html',
  styleUrls: ['./insert-command.component.less'],
})
export class InsertCommandComponent implements OnInit {
  constructor(
    private basicFormService: BasicFormService,
    private formBuilder: FormBuilder,
    private nzMessageService: NzMessageService,
  ) {
  }

  @Input()
  dataSourceSchema: DataSourceSchema;

  @Input()
  selectedKey: string;

  @Output()
  execute: EventEmitter<ICommandPayload> = new EventEmitter<ICommandPayload>();

  self = this;

  formGroups: {
    name: string;
    items: (FormItem<any> | StyleFormItem<any>)[];
  }[] = [];

  validateForm: FormGroup;

  visible: boolean = false;

  dataSourceModalVisible: boolean = false;

  currentType: WidgetType | string = null;


  commands: any[] = [
    {
      name: '容器',
      type: 'container',
      handler: this.handleInserting.bind(this, this, WidgetType.container),
    },
    {
      name: '文本',
      type: 'text',
      handler: this.handleInserting.bind(this, this, WidgetType.text),
    },
    {
      name: '链接',
      type: 'link',
      handler: this.handleInserting.bind(this, this, WidgetType.link),
    },
    {
      name: '列表',
      type: 'list',
      handler: this.handleInserting.bind(this, this, WidgetType.list),
    },
    {
      name: '表格',
      type: 'table',
      handler: this.handleInserting.bind(this, this, WidgetType.table),
    },
    {
      name: '图片',
      type: 'image',
      handler: this.handleInserting.bind(this, this, WidgetType.image),
    },
    {
      name: '表单',
      type: 'form',
      handler: this.handleInserting.bind(this, this, WidgetType.form),
    },
    {
      name: '数据源',
      type: 'dataSource',
      handler: this.handleInsertingDataSource.bind(this, this),
    },
  ];

  ngOnInit() {
    this.validateForm = this.formBuilder.group({});
    this.basicFormService.dataSourceSchema = this.dataSourceSchema;
  }

  hof(item: FormItem): (option: NzCascaderOption, _index: number) => boolean {
    return (option: NzCascaderOption, _index: number) => this.handleChangingCascade(option, _index, item);
  }

  handleChangingCascade(option: NzCascaderOption, _index: number, item: FormItem):boolean {
    return option.type === item.valueType;
  }

  /* event handlers */
  handleInserting(thisArg, currentType) {
    this.formGroups = [];
    this.currentType = currentType;
    const containerFormGroups = [
      {
        name: '基本设置',
        items: this.basicFormService.getBasicFormItems(),
      },
      {
        name: '边框',
        items: [
          ...this.basicFormService.getMarginFormItems(),
          ...this.basicFormService.getBorderFormItems(),
          ...this.basicFormService.getPaddingFormItems(),
        ],
      },
      {
        name: '高度',
        items: this.basicFormService.getHeightFormItems(),
      },
      {
        name: '宽度',
        items: this.basicFormService.getWidthFormItems(),
      },
      {
        name: '子元素对齐方式',
        items: this.basicFormService.getAlignmentFormItems(),
      },
      {
        name: '高级设置',
        items: [
          ...this.basicFormService.getLayoutFormItems(),
          ...this.basicFormService.getPositioningFormItems(),
          ...this.basicFormService.getBackgroundFormItems(),
        ],
      },
    ];
    const dataSourceFormGroups = {
        name: '数据源设置',
        items: this.basicFormService.getListDataSourceFormItems(),
      };
    switch (currentType) {
      case WidgetType.container:
        this.formGroups = containerFormGroups;
        break;
      case WidgetType.list:
        const cascadeOptions = this.basicFormService.convertDataSourceSchemaToCascadeOptions();
        if (!cascadeOptions) {
          this.nzMessageService.error('请先插入列表数据源，然后重试');
          return;
        }
        containerFormGroups.splice(1, 0, dataSourceFormGroups);
        this.formGroups = containerFormGroups;
        break;
      case WidgetType.text:
        this.formGroups = [
          {
            name: '基本设置',
            items: this.basicFormService.getBasicFormItems(),
          },
          {
            name: '文字设置',
            items: this.basicFormService.getTextFormItems(),
          },
        ];
        break;
      case WidgetType.link:
        this.formGroups = [
          {
            name: '基本设置',
            items: this.basicFormService.getBasicFormItems(),
          },
          {
            name: '链接设置',
            items: this.basicFormService.getLinkFormItems(),
          },
        ];
        break;
      case WidgetType.image:
        this.formGroups = [
          {
            name: '基本设置',
            items: this.basicFormService.getBasicFormItems(),
          },
          {
            name: '图片设置',
            items: this.basicFormService.getImageFormItems(),
          },
        ];
        break;
      case 'table':
        // TODO
        break;
      case 'form':
        // TODO
        break;
      default:
        throw new Error(`unknown type: ${currentType}`);
    }
    // TODO 后续要重构
    const tmp = {};
    this.formGroups.forEach(group => {
      group.items.forEach(item => {
        tmp[item.name] = [null, [Validators.required]];
      });
    });
    this.validateForm = this.formBuilder.group(tmp);
    this.visible = true;
  }

  handleInsertingDataSource() {
    this.dataSourceModalVisible = true;
    this.currentType = 'dataSource';
    this.formGroups = [
      {
        name: '数据源设置',
        items: this.basicFormService.getDataSourceForm(),
      }
    ];
    const tmp = {};
    this.formGroups.forEach(group => {
      group.items.forEach(item => {
        tmp[item.name] = [null, [Validators.required]];
      });
    });
    this.validateForm = this.formBuilder.group(tmp);
  }

  hideDataSourceModal() {
    this.dataSourceModalVisible = false;
  }

  hideModal() {
    this.visible = false;
  }

  onSubmit() {
    const data = this.basicFormService.convertFormDataToSchema(
      this.validateForm.getRawValue(),
      this.currentType,
    );
    this.hideModal();
    this.execute.emit({
      type: CommandType.insert,
      payload: {
        type: this.currentType,
        data,
      },
    });
  }

  onSubmitDataSource() {
    this.hideDataSourceModal();
    const formValue = this.validateForm.getRawValue();
    try {
      const dataSourceSchema: DataSourceSchema = this.basicFormService.exportDataSourceSchema(formValue.dataSource);
      this.execute.emit({
        type: CommandType.insert,
        payload: {
          type: this.currentType,
          data: dataSourceSchema,
        },
      });
      this.basicFormService.dataSourceSchema = dataSourceSchema;
    } catch (err) {
      this.nzMessageService.error(err);
    }
  }
}
