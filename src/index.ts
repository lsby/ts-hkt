export interface HktType {
  参数长度: number
  _参数容器: {}
  参数: Record<number, any>
  结果: any
}
export type 类型调用<F extends HktType, A> = F['参数长度'] extends 0
  ? F['结果']
  : 数组长度加一<取对象键们<F['_参数容器']>> extends F['参数长度']
    ? (F & {
        参数: [...取对象值们<F['_参数容器']>, A]
      })['结果']
    : F & {
        _参数容器: Record<取对象键们<F['_参数容器']>['length'], A>
      }

export type 类型调用数组<F extends HktType, A extends any[]> = A extends []
  ? 类型调用<F, A>
  : A extends [infer x, ...infer xs]
    ? 类型调用<F, x> extends infer Fx
      ? Fx extends HktType
        ? 类型调用数组<Fx, xs>
        : Fx
      : never
    : never

type 数组长度加一<Arr extends any[]> = [...Arr, '占位符']['length']

type 联合转与<联合> = (联合 extends any ? (a: 联合) => any : never) extends (a: infer x) => any ? x : never
type 联合转函数联合<联合> = 联合 extends any ? (a: 联合) => any : never
type 联合最后元素<联合> = 联合转与<联合转函数联合<联合>> extends (a: infer x) => any ? x : never
type 联合转元组<联合, 最后元素 = 联合最后元素<联合>> = [联合] extends [never]
  ? []
  : [...联合转元组<Exclude<联合, 最后元素>>, 最后元素]

type 取对象键们<obj> = 联合转元组<keyof obj> extends infer r ? (r extends any[] ? r : never) : never
type 取对象值们<对象, 剩余的键 extends any[] = 联合转元组<keyof 对象>> = 剩余的键 extends []
  ? []
  : 剩余的键 extends [infer a, ...infer as]
    ? a extends keyof 对象
      ? [对象[a], ...取对象值们<对象, as>]
      : never
    : never
