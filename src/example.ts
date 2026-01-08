import { HktType, 从高阶类型推断内容类型, 宽泛的类型调用, 类型调用, 类型调用数组 } from './index.js'

// 在 TypeScript 中，有一个根本性的限制：类型系统不支持“一等”类型的构造器（First-class Type Constructors）。
// 这个库通过模拟高阶类型（Higher-Kinded Types, HKT）来解决这个问题。
//
// 在 Haskell 等语言中，Array (类型构造器) 和 Array Int (具体类型) 是有明确区别的，且二者都能独立存在。
// 但在 Typescript 中，`Array` 不能在不提供参数的情况下作为泛型参数传递。
//
// 例如:
// type F<Fn> = Fn<number> // 报错: 类型“Fn”不是泛型类型。
// type a = F<Array> // 报错: 泛型类型“Array<T>”需要 1 个类型参数。
//
// 使用本库的解决方法:
// 先定义一个“高阶类型”接口来模拟 Array 构造器。
// 需要标记该构造器的元数（参数长度）以及计算结果。
interface 数组高阶类型 extends HktType {
  参数长度: 1
  结果: Array<this['参数'][0]>
}
// 接着就可以进行类型运算了：
// 通过 "类型调用" 实现柯里化风格的参数填充，同时也支持逆向推导内容。
type a1 = 类型调用<数组高阶类型, number> // number[]
type a2 = 类型调用数组<数组高阶类型, [number]> // number[]
type a3 = 从高阶类型推断内容类型<数组高阶类型, number[]> // number

// 对于多参数类型也是一样
class Either<L, R> {
  // 实现略
}
interface EitherHkt extends HktType {
  参数长度: 2
  结果: Either<this['参数'][0], this['参数'][1]>
}
// 支持部分应用 (Partial Application)
type b1 = 类型调用<EitherHkt, string> // 类似于 Either<string, ?>
type b2 = 类型调用<b1, number> // Either<string, number>
type b3 = 类型调用数组<EitherHkt, [string, number]> // Either<string, number>
type b4 = 从高阶类型推断内容类型<EitherHkt, b1> // string
type b5 = 从高阶类型推断内容类型<b1, b2> // number

// 复杂示例
// 一个类型安全且支持自动推论的 map 函数

// 这里的函子(Functor)和 Haskell 等纯函数式语言的表现形式略有不同
//
// 在 Haskell 中，通常表示为：
// class Functor f where
//   map :: (a -> b) -> f a -> f b
//
// 注意到 Haskell 的 map 是独立的函数。
// 而在 Typescript 中，我们更倾向于对象风格：`数据.map(函数)`。
// Typescript 的类型约束（implements）也是基于对象接口的，
// 因此这里的“函子”接口接收两个参数：一个是高阶类型构造器 F，一个是它当前包裹的类型 A。
declare const 对应高阶类型: unique symbol
interface 函子<F extends HktType, A> {
  [对应高阶类型]: F
  map<B>(fn: (a: A) => B): 类型调用<F, B>
}

// 一个具体的类型实例
class 我的容器<A> implements 函子<我的容器高阶类型, A> {
  declare [对应高阶类型]: 我的容器高阶类型
constructor(private a: A) {}
  
  map<B>(fn: (a: A) => B): 我的容器<B> {
    return new 我的容器(fn(this.a))
  }
}
interface 我的容器高阶类型 extends HktType {
  参数长度: 1
  结果: 我的容器<this['参数'][0]>
}

// 独立的 map 函数
// 类型签名对应 FP 中的: map :: (A -> B) -> F A -> F B
function map<F extends HktType, FA, A extends 从高阶类型推断内容类型<F, FA>, B>(
  fn: (_: A) => B,
  a: FA & 函子<F, A>,
): 类型调用<F, B> {
  return a.map(fn)
}

// 此时 map 的完整泛型推导结果为: map<我的容器高阶类型, 我的容器<number>, number, string>
var x1 = map((a) => a.toString(), new 我的容器(1))

// 没有实现函子的类型会报错:
// - 类型 "number[]" 中缺少属性 "[对应高阶类型]"，但类型 "函子<HktType, string>" 中需要该属性。
// var x2 = map((a: string) => a.toString(), [1])
