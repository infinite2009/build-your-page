import ListItemOption from '@/interfaces/list-item-option';
import { DataMappingOperation } from '@/interfaces/schema/data-mapping.schema';
import DataSourceSchema from '@/interfaces/schema/data-source.schema';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataMappingService {
  constructor() {}

  output(dataMappingItemSchema: DataMappingOperation, dataSourceSchema: DataSourceSchema, listItemOption: ListItemOption = null): any {
    if (!dataMappingItemSchema || !dataSourceSchema) {
      return undefined;
    }
    let { ref } = dataMappingItemSchema;
    // 如果是在 list 中渲染，需要处理下 ref，把里边的 [0] 替换为对应的索引
    if (listItemOption) {
      ref = this.processListItemDataRef(listItemOption, ref);
    }
    const { example } = dataSourceSchema;
    const outputFunc = new Function('data', `return ${ref.replace(/\.(\d+)/, '[$1]')}`);
    return outputFunc(example);
    // TODO 这里还有问题
    // switch (operator) {
    //   case DataMappingOperator.interpolate:
    //     return refVariable;
    //   default:
    //     throw new Error('暂时不支持其他类型的映射操作');
    // }
  }

  /*
   * 把 item data ref 中的硬编码 [0] 替换为真实的索引值
   */
  processListItemDataRef(listItemOption: ListItemOption, dataRef: string): string {
    const { listDataRef, itemIndex } = listItemOption;
    const indexRegExp = /(\[\d+])/;
    const listRefArr = listDataRef.split(indexRegExp).filter(item => item !== '');
    const convertedRef = dataRef.replace(/\.0/, '[0]');
    const dataRefArr = convertedRef.split(indexRegExp).filter(item => item !== '');
    const originalItemRef = dataRefArr.splice(0, listRefArr.length).join('');
    const indexItemRef = originalItemRef.replace(/\[0]?/, `[${itemIndex}]`);
    return indexItemRef + dataRefArr.join('');
  }
}
