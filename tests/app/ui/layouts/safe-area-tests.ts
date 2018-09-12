import { Page } from "tns-core-modules/ui/page";
import { GridLayout, ItemSpec } from "tns-core-modules/ui/layouts/grid-layout";
import { Button } from "tns-core-modules/ui/button";
import * as TKUnit from "../../TKUnit";
import * as view from "tns-core-modules/ui/core/view";
import { unsetValue } from "tns-core-modules/ui/core/view";
import * as builder from "tns-core-modules/ui/builder";
import * as testModule from "../../ui-test";
import * as layoutHelper from "./layout-helper";
import * as platform from "tns-core-modules/platform";
import { ios as iosUtils } from "tns-core-modules/utils/utils";
import * as commonTests from "./common-layout-tests";
import * as helper from "../helper";
import { parse } from "tns-core-modules/ui/builder";
import { dipToDp, left, top, right, bottom, height, width,
    paddingLeft, paddingTop, paddingRight, paddingBottom,
    equal, closeEnough, notEqual, check,
    heightEqual, widthEqual,
    isLeftAlignedWith, isRightAlignedWith, isTopAlignedWith, isBottomAlignedWith,
    isLeftOf, isRightOf, isBelow, isAbove,
    isLeftWith, isAboveWith, isRightWith, isBelowWith } from "./layout-tests-helper";

export class SafeAreaTests extends testModule.UITest<any> {

    public create(): any {
        return null;
    }

    // TODO: Start Refactor
    private executeSnippet<U extends { root: view.View }>(ui: U, setup: (ui: U) => void, test: (ui: U) => void): void {
        function waitUntilTestElementLayoutIsValid(view: view.View, timeoutSec?: number): void {
            TKUnit.waitUntilReady(() => {
                return view.isLayoutValid;
            }, timeoutSec || 1);
        }

        setup(ui);
        helper.buildUIAndRunTest(ui.root, () => {
            waitUntilTestElementLayoutIsValid(ui.root);
            test(ui);
        });
    };

    private noop() {
        // no operation
    };
    // TODO: End Refactor

    // Common
    private layout_in_full_screen_test(layout: view.View) {
        const fullScreenOrigin = { x: 0, y: 0};
        if (platform.isIOS && iosUtils.MajorVersion < 11) {
            const safeAreaOrigin = layout.parent.nativeViewProtected.safeAreaLayoutGuide.layoutFrame.origin;
            fullScreenOrigin.x += dipToDp(safeAreaOrigin.x);
            fullScreenOrigin.y += dipToDp(safeAreaOrigin.y);
        }

        const l = left(layout);
        const t = top(layout);
        const r = right(layout);
        const b = bottom(layout);
        const widthPixels = platform.screen.mainScreen.widthPixels;
        const heightPixels = platform.screen.mainScreen.heightPixels;
        equal(l, fullScreenOrigin.x, `${layout}.left - actual:${l}; expected: ${fullScreenOrigin.x}`);
        equal(t, fullScreenOrigin.y, `${layout}.top - actual:${t}; expected: ${fullScreenOrigin.y}`);
        equal(r, widthPixels, `${layout}.right - actual:${r}; expected: ${widthPixels}`);
        equal(b, heightPixels, `${layout}.bottom - actual:${b}; expected: ${heightPixels}`);
    }

    // Absolute
    private getAbsoluteViews(template: string) {
        let root = parse(template);
        return {
            root,
            child0: root.getViewById("child0") as view.View,
        };
    };

    public test_absolute_in_full_screen() {
        const snippet = `
        <AbsoluteLayout id="abs" backgroundColor="Crimson"></AbsoluteLayout>
        `;

        this.executeSnippet(
            this.getAbsoluteViews(snippet),
            this.noop,
            ({ root }) => { this.layout_in_full_screen_test(root); }
        );
    }


    public test_absolute_children_components_in_safe_area() {
        const snippet = `
        <AbsoluteLayout id="abs">
            <Button id="child0" text="Left: 0, Top: 0" left="0" top="0" backgroundColor="red" />
            <Button text="Left: 30, Top: 80" left="30" top="80" backgroundColor="green" />
            <Button text="Left: 150, Top: 25" left="150" top="25" backgroundColor="blue" />
            <Button text="Left: 70, Top: 150" left="70" top="150" backgroundColor="yellow" />
        </AbsoluteLayout>
        `;

        this.executeSnippet(
            this.getAbsoluteViews(snippet),
            this.noop,
            ({ root, child0 }) => {
                const insets = root.getSafeAreaInsets();
                equal(left(child0), insets.left, `${child0}.left - actual: ${left(child0)} expected: ${insets.left}`);
                equal(top(child0), insets.top, `${child0}.top - actual: ${top(child0)} expected: ${insets.top}`);
            }
        );
    }

    public test_absolute_nested_layouts_beyond_safe_area() {
        const snippet = `
        <AbsoluteLayout id="abs">
            <AbsoluteLayout id="child0" left="0" top="0" backgroundColor="red">
                <Label text="Left: 0, Top: 0" />
            </AbsoluteLayout>
            <AbsoluteLayout left="30" top="80" backgroundColor="green">
                <Label text="Left: 30, Top: 80" />
            </AbsoluteLayout>
            <AbsoluteLayout left="150" top="25" backgroundColor="blue">
                <Label text="Left: 150, Top: 25" />
            </AbsoluteLayout>
            <AbsoluteLayout left="70" top="150" backgroundColor="yellow">
                <Label text="Left: 70, Top: 150"  />
            </AbsoluteLayout>
        </AbsoluteLayout>
        `;

        this.executeSnippet(
            this.getAbsoluteViews(snippet),
            this.noop,
            ({ root, child0 }) => {
                isLeftAlignedWith(root, child0);
                isTopAlignedWith(root, child0);
            }
        );
    }

    // Dock
    private getDockViews(template: string) {
        let root = parse(template);
        return {
            root,
            childLeft: root.getViewById("childLeft") as view.View,
            childTop: root.getViewById("childTop") as view.View,
            childRight: root.getViewById("childRight") as view.View,
            childBottom: root.getViewById("childBottom") as view.View,
            childFill: root.getViewById("childFill") as view.View,
        };
    };

    public test_dock_in_full_screen() {
        const snippet = `
        <DockLayout id="dock" backgroundColor="Crimson"></DockLayout>
        `;

        this.executeSnippet(
            this.getDockViews(snippet),
            this.noop,
            ({ root }) => { this.layout_in_full_screen_test(root); }
        );
    }

    public test_dock_children_components_in_safe_area() {
        const snippet = `
        <DockLayout id="dock" stretchLastChild="true">
            <Label id="childLeft" dock="Left" text="left" backgroundColor="red" />
            <Label id="childTop" dock="Top" text="top" backgroundColor="green" />
            <Label id="childRight" dock="Right" text="right" backgroundColor="blue" />
            <Label id="childBottom" dock="Bottom" text="bottom" backgroundColor="yellow" />
            <Label id="childFill" text="fill"/>
        </DockLayout>
        `;

        this.executeSnippet(
            this.getDockViews(snippet),
            this.noop,
            ({ root, childLeft, childTop, childRight, childBottom, childFill }) => {
                const insets = root.getSafeAreaInsets();

                equal(left(childLeft), insets.left, `${childLeft}.left - actual: ${left(childLeft)} expected: ${insets.left}`);
                equal(top(childLeft), insets.top, `${childLeft}.top - actual: ${top(childLeft)} expected: ${insets.top}`);

                equal(top(childTop), insets.top, `${childTop}.top - actual: ${top(childTop)} expected: ${insets.top}`);
                equal(right(childTop), width(root) - insets.right, `${childTop}.right - actual: ${right(childTop)} expected: ${width(root) - insets.right}`);

                equal(right(childRight), width(root) - insets.right, `${childRight}.right - actual: ${right(childRight)} expected: ${width(root) - insets.right}`);
                equal(bottom(childRight), height(root) - insets.bottom, `${childRight}.bottom - actual: ${bottom(childRight)} expected: ${height(root) - insets.bottom}`);

                equal(bottom(childBottom), height(root) - insets.bottom, `${childBottom}.bottom - actual: ${bottom(childBottom)} expected: ${height(root) - insets.bottom}`);

                isLeftWith(childLeft, childFill, width(childLeft));
                isBelowWith(childTop, childFill, height(childTop));
                isRightWith(childFill, childRight, width(childRight));
                isAboveWith(childFill, childBottom, height(childBottom));
            }
        );
    }

    public test_dock_nested_layouts_beyond_safe_area() {
        const snippet = `
        <DockLayout id="dock" stretchLastChild="true">
            <DockLayout id="childLeft" dock="Left" text="left" backgroundColor="red">
                <Label text="left"/>
            </DockLayout>
            <DockLayout id="childTop" dock="Top" text="top" backgroundColor="green">
                <Label text="top" />
            </DockLayout>
            <DockLayout id="childRight" dock="Right" text="right" backgroundColor="blue">
                <Label text="right" />
            </DockLayout>
            <DockLayout id="childBottom" dock="Bottom" text="bottom" backgroundColor="yellow">
                <Label text="bottom" />
            </DockLayout>
            <DockLayout id="childFill" text="fill">
                <Label text="fill" />
            </DockLayout>
        </DockLayout>
        `;

        this.executeSnippet(
            this.getDockViews(snippet),
            this.noop,
            ({ root, childLeft, childTop, childRight, childBottom, childFill }) => {
                isLeftAlignedWith(root, childLeft);
                isTopAlignedWith(root, childLeft);

                isTopAlignedWith(root, childTop);
                isRightAlignedWith(root, childTop);

                isRightAlignedWith(root, childRight);
                isBottomAlignedWith(root, childRight);

                isBottomAlignedWith(root, childRight);

                const sumOfNestedDockHeights = height(childTop) + height(childFill) + height(childBottom);
                equal(height(root), sumOfNestedDockHeights, `dock height<${height(root)}> sum of nested docks height <${sumOfNestedDockHeights}>`);

                const sumOfNestedDockWidths = width(childLeft) + width(childFill) + width(childRight)
                equal(width(root), sumOfNestedDockWidths, `dock width<${width(root)}> sum of nested docks width <${sumOfNestedDockWidths}>`);
            }
        );
    }

    // Grid
    private getGridViews (template: string) {
        let root = parse(template);
        return {
            root,
            grid: root.getViewById("grid") as GridLayout,
            cells: [
                [ root.getViewById("cell00") as view.View, root.getViewById("cell01") as view.View, root.getViewById("cell02") as view.View ],
                [ root.getViewById("cell10") as view.View, root.getViewById("cell11") as view.View, root.getViewById("cell12") as view.View ],
                [ root.getViewById("cell20") as view.View, root.getViewById("cell21") as view.View, root.getViewById("cell22") as view.View ]
            ]
        };
    };

    public test_grid_layout_in_full_screen() {
        const snippet = `
        <GridLayout id="grid" backgroundColor="Crimson"></GridLayout>
        `;

        this.executeSnippet(
            this.getGridViews(snippet),
            this.noop,
            ({ root }) => { this.layout_in_full_screen_test(root); }
        );
    }

    public test_component_cells_layout_in_safe_area() {
        const snippet = `
        <GridLayout id="grid" rows="*, *, *" columns="*, *, *" backgroundColor="Crimson">
            <Label row="0" col="0" id="cell00" text="overflowing text, overflowing text"></Label>
            <Label row="0" col="1" id="cell01" text="overflowing text, overflowing text"></Label>
            <Label row="0" col="2" id="cell02" text="overflowing text, overflowing text"></Label>
            <Label row="1" col="0" id="cell10" text="overflowing text, overflowing text"></Label>
            <Label row="1" col="1" id="cell11" text="overflowing text, overflowing text"></Label>
            <Label row="1" col="2" id="cell12" text="overflowing text, overflowing text"></Label>
            <Label row="2" col="0" id="cell20" text="overflowing text, overflowing text"></Label>
            <Label row="2" col="1" id="cell21" text="overflowing text, overflowing text"></Label>
            <Label row="2" col="2" id="cell22" text="overflowing text, overflowing text"></Label>
        </GridLayout>
        `;

        this.executeSnippet(
            this.getGridViews(snippet),
            this.noop,
            ({ root, grid, cells }) => {
                const insets = root.getSafeAreaInsets();

                equal(left(cells[0][0]), insets.left, `cell00 left actual:<${left(cells[0][0])}> expected:<${insets.left}>`);
                equal(left(cells[1][0]), insets.left, `cell10 left actual:<${left(cells[1][0])}> expected:<${insets.left}>`);
                equal(left(cells[2][0]), insets.left, `cell20 left actual:<${left(cells[2][0])}> expected:<${insets.left}>`);

                isBelowWith(grid, cells[0][0], insets.top);
                isBelowWith(grid, cells[0][1], insets.top);
                isBelowWith(grid, cells[0][2], insets.top);

                equal(right(cells[0][2]), width(grid) - insets.right, `cell02 left actual:<${left(cells[0][2])}> expected:<${width(grid) - insets.right}>`);
                equal(right(cells[1][2]), width(grid) - insets.right, `cell12 left actual:<${left(cells[1][2])}> expected:<${width(grid) - insets.right}>`);
                equal(right(cells[2][2]), width(grid) - insets.right, `cell22 left actual:<${left(cells[2][2])}> expected:<${width(grid) - insets.right}>`);

                isAboveWith(cells[2][0], grid, insets.bottom);
                isAboveWith(cells[2][1], grid, insets.bottom);
                isAboveWith(cells[2][2], grid, insets.bottom);

                equal(height(cells[0][1]), height(cells[1][1]), `cell height should be equal - cell01<${height(cells[0][1])}> - cell11<${height(cells[1][1])}>`);
                equal(height(cells[1][1]), height(cells[2][1]), `cell height should be equal - cell11<${height(cells[1][1])}> - cell21<${height(cells[2][1])}>`);
                const sumOfLabelHeightAndInsets = insets.top + height(cells[0][1]) + height(cells[1][1]) + height(cells[2][1]) + insets.bottom;
                equal(height(grid), sumOfLabelHeightAndInsets, `grid height<${height(grid)}> sum of labels height and insets<${sumOfLabelHeightAndInsets}>`);

                equal(width(cells[1][0]), width(cells[1][1]), `cell width should be equal - cell10<${width(cells[1][0])}> - cell11<${width(cells[1][1])}>`);
                equal(width(cells[1][1]), width(cells[1][2]), `cell width should be equal - cell11<${width(cells[1][1])}> - cell12<${width(cells[1][2])}>`);
                const sumOfLabelWidthsAndInsets = insets.left + width(cells[1][0]) + width(cells[1][1]) + width(cells[1][2]) + insets.right;
                equal(width(grid), sumOfLabelWidthsAndInsets, `grid width<${width(grid)}> sum of nested grids width and insets<${sumOfLabelWidthsAndInsets}>`);
            }
        );
    }

    public test_nested_grid_cells_layout_beyond_safe_area() {
        const snippet = `
        <GridLayout id="grid" rows="*, *, *" columns="*, *, *" backgroundColor="Crimson">
            <GridLayout row="0" col="0" id="cell00" backgroundColor="SkyBlue"></GridLayout>
            <GridLayout row="0" col="1" id="cell01" backgroundColor="Indigo"></GridLayout>
            <GridLayout row="0" col="2" id="cell02" backgroundColor="Crimson"></GridLayout>
            <GridLayout row="1" col="0" id="cell10" backgroundColor="Chocolate"></GridLayout>
            <GridLayout row="1" col="1" id="cell11" backgroundColor="Cornsilk"></GridLayout>
            <GridLayout row="1" col="2" id="cell12" backgroundColor="BurlyWood"></GridLayout>
            <GridLayout row="2" col="0" id="cell20" backgroundColor="GoldenRod"></GridLayout>
            <GridLayout row="2" col="1" id="cell21" backgroundColor="Khaki"></GridLayout>
            <GridLayout row="2" col="2" id="cell22" backgroundColor="IndianRed"></GridLayout>
        </GridLayout>
        `;

        this.executeSnippet(
            this.getGridViews(snippet),
            this.noop,
            ({ root, grid, cells }) => {                
                isLeftAlignedWith(grid, cells[0][0]);
                isLeftAlignedWith(grid, cells[1][0]);
                isLeftAlignedWith(grid, cells[2][0]);

                isTopAlignedWith(grid, cells[0][0]);
                isTopAlignedWith(grid, cells[0][1]);
                isTopAlignedWith(grid, cells[0][2]);

                isRightAlignedWith(grid, cells[0][2]);
                isRightAlignedWith(grid, cells[1][2]);
                isRightAlignedWith(grid, cells[2][2]);

                isBottomAlignedWith(grid, cells[2][0]);
                isBottomAlignedWith(grid, cells[2][1]);
                isBottomAlignedWith(grid, cells[2][2]);

                check(height(cells[0][1]) >= height(cells[1][1]), `cell01 height<${height(cells[0][1])}> not greater or equal cell11 height<${height(cells[1][1])}>`);
                check(height(cells[1][1]) <= height(cells[2][1]), `cell11 height<${height(cells[1][1])}> not less or equal cell21 height<${height(cells[2][1])}>`);
                const sumOfNestedGridHeights = height(cells[0][1]) + height(cells[1][1]) + height(cells[2][1]);
                equal(height(grid), sumOfNestedGridHeights, `grid height<${height(grid)}> sum of nested grids height <${sumOfNestedGridHeights}>`);

                check(width(cells[1][0]) >= width(cells[1][1]), `cell10 width<${width(cells[1][0])}> not greater or equal cell11 width<${width(cells[1][1])}>`);
                check(width(cells[1][1]) <= width(cells[1][2]), `cell11 width<${width(cells[1][1])}> not less or equal cell12 width<${width(cells[1][2])}>`);
                const sumOfNestedGridWidths = width(cells[1][0]) + width(cells[1][1]) + width(cells[1][2])
                equal(width(grid), sumOfNestedGridWidths, `grid width<${width(grid)}> sum of nested grids width <${sumOfNestedGridWidths}>`);
            }
        );
    }

    // Stack
    private getStackViews(template: string) {
        let root = parse(template);
        return {
            root,
            child0: root.getViewById("child0") as view.View,
            child1: root.getViewById("child1") as view.View
        };
    };

    public test_stack_in_full_screen() {
        const snippet = `
        <StackLayout id="stack" backgroundColor="Crimson"></StackLayout>
        `;

        this.executeSnippet(
            this.getStackViews(snippet),
            this.noop,
            ({ root }) => { this.layout_in_full_screen_test(root); }
        );
    }

    public test_stack_horizontal_children_components_in_safe_area() {
        const snippet = `
        <StackLayout id="stack" orientation="horizontal" backgroundColor="Crimson">
            <Label id="child0" text="123"></Label>
            <Label id="child1" text="456"></Label>
            <Label id="child2" text="789"></Label>
            <Label id="child3" text="123"></Label>
            <Label id="child4" text="456"></Label>
            <Label id="child5" text="789"></Label>
            <Label id="child6" text="123"></Label>
            <Label id="child7" text="456"></Label>
            <Label id="child8" text="789"></Label>
            <Label id="child9" text="123"></Label>
            <Label id="child10" text="456"></Label>
            <Label id="child11" text="789"></Label>
            <Label id="child12" text="123"></Label>
            <Label id="child13" text="456"></Label>
            <Label id="child14" text="789"></Label>
            <Label id="child15" text="123"></Label>
            <Label id="child16" text="456"></Label>
            <Label id="child17" text="789"></Label>
            <Label id="child18" text="123"></Label>
            <Label id="child19" text="456"></Label>
            <Label id="child20" text="789"></Label>
            <Label id="child21" text="123"></Label>
            <Label id="child22" text="456"></Label>
            <Label id="child23" text="789"></Label>
            <Label id="child24" text="123"></Label>
            <Label id="child25" text="456"></Label>
            <Label id="child26" text="789"></Label>
        </StackLayout>
        `;

        this.executeSnippet(
            this.getStackViews(snippet),
            this.noop,
            ({ root, child0, child1 }) => {
                const insets = root.getSafeAreaInsets();
                equal(left(child0), insets.left, `${child0}.left - actual: ${left(child0)} expected: ${insets.left}`);
                equal(top(child0), insets.top, `${child0}.top - actual: ${top(child0)} expected: ${insets.top}`);
                equal(bottom(child0), height(root) - insets.bottom, `${child0}.bottom - actual: ${bottom(child0)} expected: ${height(root) - insets.bottom}`);
                isLeftWith(child0, child1, width(child0));
            }
        );
    }

    public test_stack_vertical_children_components_in_safe_area() {
        const snippet = `
        <StackLayout id="stack" orientation="vertical" backgroundColor="Crimson">
            <Label id="child0" text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label id="child1" text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
        </StackLayout>
        `;

        this.executeSnippet(
            this.getStackViews(snippet),
            this.noop,
            ({ root, child0, child1 }) => {
                const insets = root.getSafeAreaInsets();
                equal(left(child0), insets.left, `${child0}.left - actual: ${left(child0)} expected: ${insets.left}`);
                equal(top(child0), insets.top, `${child0}.top - actual: ${top(child0)} expected: ${insets.top}`);
                equal(right(child0), width(root) - insets.right, `${child0}.right - actual: ${right(child0)} expected: ${width(root) - insets.right}`);
                isBelowWith(child0, child1, height(child0));
            }
        );
    }

    public test_stack_nested_layouts_beyond_safe_area() {
        const snippet = `
        <StackLayout id="stack" backgroundColor="Crimson">
            <StackLayout id="child0" backgroundColor="GoldenRod">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
            <StackLayout id="child1" backgroundColor="LemonChiffon">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
            <StackLayout backgroundColor="Crimson">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
            <StackLayout backgroundColor="Chocolate">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
            <StackLayout backgroundColor="Cornsilk">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
            <StackLayout backgroundColor="BurlyWood">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
            <StackLayout backgroundColor="Khaki">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
            <StackLayout backgroundColor="LightBlue">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
            <StackLayout backgroundColor="GoldenRod">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
            <StackLayout backgroundColor="Indigo">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
            <StackLayout backgroundColor="Crimson">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
            <StackLayout backgroundColor="Chocolate">
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
                <Label text="overflowing text, overflowing text, overflowing text, overflowing text, overflowing text, overflowing text"></Label>
            </StackLayout>
        </StackLayout>
        `;

        this.executeSnippet(
            this.getStackViews(snippet),
            this.noop,
            ({ root, child0, child1 }) => {
                isLeftAlignedWith(root, child0);
                isTopAlignedWith(root, child0);
                isRightAlignedWith(root, child0);
            }
        );
    }
}

export function createTestCase(): SafeAreaTests {
    return new SafeAreaTests();
}