import { debounce } from 'lodash';

import { Socket } from 'socket.io-client';

import UIComponent from '@uiLib/ui-component';
import { emitClient, LoadResourceJson, onClient } from '@lib/ui';
import { ColorPalettes, ColorPaletteNames } from '@lib/shared/color-palettes';

import { defaultOverlays } from './data';
import { Container, Modal, ModalTitle } from './styled';
import StyleColorSelector from './components/StyleColorSelector';
import { GenderSelect } from './components/Gender';
import TintSelector from './components/TintSelector';

const componentFiles = [
  '2886757168',
  'accessories',
  'ammo-pistols',
  'ammo-rifles',
  'aprons',
  'armor',
  'badges',
  'beards-chin',
  'beards-chops',
  'beards-complete',
  'beards-mustache',
  'belt-buckles',
  'belts',
  'bodies-lower',
  'bodies-upper',
  'boot-accessories',
  'boots',
  'chaps',
  'cloaks',
  'coats',
  'coats-closed',
  'dresses',
  'eyes',
  'eyewear',
  'gauntlets',
  'gloves',
  'gunbelt-accs',
  'gunbelts',
  'hair',
  'hair-accessories',
  'hats',
  'heads',
  'holsters-crossdraw',
  'holsters-knife',
  'holsters-left',
  'holsters-right',
  'horse-accessories',
  'horse-bedrolls',
  'horse-blankets',
  'horse-bridles',
  'horse-manes',
  'horse-mustache',
  'horse-saddlebags',
  'horse-saddles',
  'horse-shoes',
  'horse-tails',
  'jewelry-bracelets',
  'jewelry-rings-left',
  'jewelry-rings-right',
  'loadouts',
  'masks',
  'masks-large',
  'neckties',
  'neckwear',
  'pants',
  'ponchos',
  'saddle-horns',
  'saddle-lanterns',
  'saddle-stirrups',
  'satchels',
  'shirts-full',
  'skirts',
  'spats',
  'suspenders',
  'talisman-belt',
  'talisman-holster',
  'talisman-satchel',
  'talisman-wrist',
  'teeth',
  'vests',
];

const ComponentsData: Record<string, UI.Customization.ComponentJson[]> = {};

const pedComponentCategories = [
  'accessories',
  'ammo_pistols',
  'ammo_rifles',
  'aprons',
  'armor',
  'badges',
  'belts',
  'belt_buckles',
  'bodies_lower',
  'bodies_upper',
  'boots',
  'boot_accessories',
  'chaps',
  'cloaks',
  'coats',
  'coats_closed',
  'eyes',
  'eyewear',
  'gauntlets',
  'gloves',
  'gunbelts',
  'hair',
  'hats',
  'heads',
  'holsters_crossdraw',
  'holsters_knife',
  'holsters_left',
  'holsters_right',
  'jewelry_bracelets',
  'jewelry_rings_left',
  'jewelry_rings_right',
  'legs_accessories',
  'loadouts',
  'masks',
  'masks_large',
  'neckties',
  'neckwear',
  'pants',
  'ponchos',
  'satchels',
  'shirts_full',
  'skirts',
  'spats',
  'suspenders',
  'vests',
];

const horseComponentCategories = ['head', 'hand', 'hair', 'mane', 'teef', 'hair', 'mane'];

export default class Customization extends UIComponent<UI.BaseProps, UI.Customization.State, {}> {
  constructor(
    props: UI.BaseProps,
    context: { socket: Socket<UISocketEvents, SocketServer.Client & SocketServer.ClientEvents> },
  ) {
    super();

    const tints: Record<string, CustomizationPalette> = {};

    for (const category of [...pedComponentCategories, ...horseComponentCategories]) {
      tints[category] = {
        palette: -1,
        tint0: 0,
        tint1: 0,
        tint2: 0,
      };
    }

    this.state = {
      show: false,
      state: 'gender',
      components: {},
      model: '',
      gender: 'male',
      currentComponents: {
        boots: {
          style: -1,
          option: 0,
        },
        shirts: {
          style: -1,
          option: 0,
        },
      },
      hiddenComponents: {},
      currentFaceOptions: {},
      currentBodyOptions: {},
      currentOverlays: defaultOverlays,
      currentWhistle: {},
      firstName: '',
      lastName: '',
      dateOfBirth: {
        day: 1,
        month: 1,
        year: 1800,
      },
      tints,
    };

    onClient('customization.state', (state) => {
      this.setState(state);
    });

    onClient('customization.set-tint-by-category', (category, tint) => {
      this.setState({ tints: { ...this.state.tints, [category]: tint } });
    });

    this.loadComponents();
  }

  async loadComponents() {
    for (const componentFile of componentFiles) {
      ComponentsData[componentFile] = (await LoadResourceJson(
        'rdr3-shared',
        `components-ui/${componentFile}.json`,
      )) as UI.Customization.ComponentJson[];
    }
  }

  onEvent(event: UI.Customization.Event) {
    this.setState(event);
  }

  sendClientData = debounce((updateCategory: string) => {
    for (const [category, data] of Object.entries(this.state.tints)) {
      if (category !== updateCategory) continue;
      if (data.palette === 0) {
        emitClient('customization.set-tint-by-category', category, {
          palette: -1,
          tint0: 0,
          tint1: 0,
          tint2: 0,
        });
      } else {
        emitClient('customization.set-tint-by-category', category, data);
      }
    }
  }, 1000);

  setTintByCategory(category: string, tint: Customization.Palette) {
    this.setState({ tints: { ...this.state.tints, [category]: tint } });
    this.sendClientData(category);
  }

  setComponent(componentType: string, style: number, option: number) {
    console.log('component', componentType, style, option);
    this.setState({ currentComponents: { ...this.state.currentComponents, [componentType]: { style, option } } });
    const components = [];
    for (const [category, data] of Object.entries(this.state.currentComponents)) {
      if (data.style > -1) {
        const component = ComponentsData[category][data.style].components[data.option];
        components.push(component.component);
      }
    }
    console.log('customization.set-components', components);
    emitClient('customization.set-components', components);
  }

  handleHighlightGender(gender: 'male' | 'female', e: MouseEvent) {
    this.setState({ gender });
    emitClient('customization.highlight', gender);
  }

  handleChooseGender(e: MouseEvent) {
    console.log('handleChooseGender');
    emitClient('customization.choose-gender');
  }

  render() {
    return (
      <>
        {this.state.show && this.state.state === 'gender' && (
          <>
            <GenderSelect
              className={this.state.gender === 'male' ? 'active' : ''}
              style={{ left: 0 }}
              onMouseEnter={this.handleHighlightGender.bind(this, 'male')}
              onMouseDown={this.handleChooseGender.bind(this)}
            />
            <GenderSelect
              className={this.state.gender === 'female' ? 'active' : ''}
              style={{ right: 0 }}
              onMouseEnter={this.handleHighlightGender.bind(this, 'female')}
              onMouseDown={this.handleChooseGender.bind(this)}
            />
          </>
        )}
        {this.state.show && this.state.state === 'creation' && (
          <>
            <Modal>
              <ModalTitle>{`Information`}</ModalTitle>
              <input type="text" placeholder="First Name" />
              <input type="text" placeholder="Last Name" />
              <input type="date" />
            </Modal>
          </>
        )}
        {this.state.show && this.state.state === 'tailor' && (
          <>
            <Modal>
              <ModalTitle>{`Clothes`}</ModalTitle>
              <StyleColorSelector
                label={`Boots`}
                onChange={(style, option) => this.setComponent('boots', style, option)}
                components={ComponentsData.boots}
                gender={this.state.gender}
              />
              <StyleColorSelector
                label={`Shirts`}
                onChange={(style, option) => this.setComponent('shirts', style, option)}
                components={ComponentsData['shirts-full']}
                gender={this.state.gender}
              />
              <pre>{JSON.stringify(this.state.currentComponents, null, 2)}</pre>
            </Modal>
          </>
        )}
        {this.state.show && (this.state.state === 'creation' || this.state.state === 'barber') && (
          <>
            <h1>Barber</h1>
          </>
        )}
        {this.state.show && (
          <>
            <Modal>
              <TintSelector
                label="Hat Tint"
                onChange={this.setTintByCategory.bind(this)}
                category={'hats'}
                palette={this.state.tints.hats.palette}
                tint0={this.state.tints.hats.tint0}
                tint1={this.state.tints.hats.tint1}
                tint2={this.state.tints.hats.tint2}
              />
              <TintSelector
                label="Coat Tint"
                onChange={this.setTintByCategory.bind(this)}
                category={'coats'}
                palette={this.state.tints.coats.palette}
                tint0={this.state.tints.coats.tint0}
                tint1={this.state.tints.coats.tint1}
                tint2={this.state.tints.coats.tint2}
              />
            </Modal>
          </>
        )}
      </>
    );
  }
}
